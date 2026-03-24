package br.com.gerenciadorpilates.scheduling.application;

import br.com.gerenciadorpilates.platform.domain.ResourceNotFoundException;
import br.com.gerenciadorpilates.scheduling.api.ScheduleBookingResponse;
import br.com.gerenciadorpilates.scheduling.api.ScheduleRescheduleResponse;
import br.com.gerenciadorpilates.scheduling.domain.ScheduleBooking;
import br.com.gerenciadorpilates.scheduling.domain.ScheduleBookingStatus;
import br.com.gerenciadorpilates.scheduling.domain.ScheduleSlot;
import br.com.gerenciadorpilates.scheduling.infrastructure.ScheduleBookingRepository;
import br.com.gerenciadorpilates.scheduling.infrastructure.ScheduleSlotRepository;
import br.com.gerenciadorpilates.students.domain.Student;
import br.com.gerenciadorpilates.students.infrastructure.StudentRepository;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ScheduleBookingService {

    private final ScheduleBookingRepository bookingRepository;
    private final ScheduleSlotRepository slotRepository;
    private final StudentRepository studentRepository;
    private final SchedulingPolicyProperties policyProperties;

    public ScheduleBookingService(
            ScheduleBookingRepository bookingRepository,
            ScheduleSlotRepository slotRepository,
            StudentRepository studentRepository,
            SchedulingPolicyProperties policyProperties
    ) {
        this.bookingRepository = bookingRepository;
        this.slotRepository = slotRepository;
        this.studentRepository = studentRepository;
        this.policyProperties = policyProperties;
    }

    @Transactional
    public ScheduleBookingResponse create(UUID slotId, UUID studentId) {
        ScheduleSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Horario nao encontrado."));
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Aluno nao encontrado."));

        bookingRepository.findBySlotIdAndStudentIdAndStatus(slotId, studentId, ScheduleBookingStatus.BOOKED)
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("O aluno ja possui reserva ativa neste horario.");
                });

        if (slot.getBookedCount() >= slot.getCapacity()) {
            throw new IllegalArgumentException("O horario informado nao possui vagas disponiveis.");
        }

        slot.incrementBookedCount();

        ScheduleBooking booking = new ScheduleBooking(
                UUID.randomUUID(),
                slotId,
                studentId,
                student.getFullName()
        );

        slotRepository.save(slot);
        return ScheduleBookingResponse.from(bookingRepository.save(booking));
    }

    @Transactional
    public ScheduleBookingResponse cancel(UUID slotId, UUID bookingId) {
        ScheduleBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva nao encontrada."));

        if (!booking.getSlotId().equals(slotId)) {
            throw new ResourceNotFoundException("Reserva nao pertence ao horario informado.");
        }

        if (booking.getStatus() == ScheduleBookingStatus.CANCELED) {
            throw new IllegalArgumentException("A reserva ja esta cancelada.");
        }

        ScheduleSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Horario nao encontrado."));

        booking.cancel();
        slot.decrementBookedCount();

        slotRepository.save(slot);
        return ScheduleBookingResponse.from(bookingRepository.save(booking));
    }

    @Transactional
    public ScheduleBookingResponse selfServiceCancel(UUID slotId, UUID bookingId) {
        ScheduleBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva nao encontrada."));
        ScheduleSlot slot = validateCancelableBooking(slotId, booking);
        validateSelfServiceWindow(slot.getStartTime(), policyProperties.minHoursBeforeCancellation(), "cancelamento");

        booking.cancel();
        slot.decrementBookedCount();
        slotRepository.save(slot);
        return ScheduleBookingResponse.from(bookingRepository.save(booking));
    }

    @Transactional
    public ScheduleBookingResponse selfServiceCancel(UUID slotId, UUID bookingId, UUID authenticatedStudentId) {
        ScheduleBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva nao encontrada."));
        validateBookingOwnership(booking, authenticatedStudentId);
        return selfServiceCancel(slotId, bookingId);
    }

    @Transactional
    public ScheduleRescheduleResponse selfServiceReschedule(UUID slotId, UUID bookingId, UUID targetSlotId) {
        ScheduleBooking originalBooking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva nao encontrada."));
        ScheduleSlot originalSlot = validateCancelableBooking(slotId, originalBooking);
        validateSelfServiceWindow(originalSlot.getStartTime(), policyProperties.minHoursBeforeReschedule(), "remarcacao");

        ScheduleSlot targetSlot = slotRepository.findById(targetSlotId)
                .orElseThrow(() -> new ResourceNotFoundException("Horario de destino nao encontrado."));

        if (targetSlot.getBookedCount() >= targetSlot.getCapacity()) {
            throw new IllegalArgumentException("O horario de destino nao possui vagas disponiveis.");
        }

        bookingRepository.findBySlotIdAndStudentIdAndStatus(
                targetSlotId,
                originalBooking.getStudentId(),
                ScheduleBookingStatus.BOOKED
        ).ifPresent(existing -> {
            throw new IllegalArgumentException("O aluno ja possui reserva ativa no horario de destino.");
        });

        originalBooking.cancel();
        originalSlot.decrementBookedCount();
        targetSlot.incrementBookedCount();

        ScheduleBooking newBooking = new ScheduleBooking(
                UUID.randomUUID(),
                targetSlotId,
                originalBooking.getStudentId(),
                originalBooking.getStudentName()
        );

        slotRepository.save(originalSlot);
        slotRepository.save(targetSlot);
        ScheduleBooking canceled = bookingRepository.save(originalBooking);
        ScheduleBooking created = bookingRepository.save(newBooking);

        return new ScheduleRescheduleResponse(
                ScheduleBookingResponse.from(canceled),
                ScheduleBookingResponse.from(created)
        );
    }

    @Transactional
    public ScheduleRescheduleResponse selfServiceReschedule(
            UUID slotId,
            UUID bookingId,
            UUID targetSlotId,
            UUID authenticatedStudentId
    ) {
        ScheduleBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva nao encontrada."));
        validateBookingOwnership(booking, authenticatedStudentId);
        return selfServiceReschedule(slotId, bookingId, targetSlotId);
    }

    @Transactional(readOnly = true)
    public List<ScheduleBookingResponse> listActiveBySlot(UUID slotId) {
        if (!slotRepository.existsById(slotId)) {
            throw new ResourceNotFoundException("Horario nao encontrado.");
        }

        return bookingRepository.findAllBySlotIdAndStatusOrderByCreatedAtAsc(slotId, ScheduleBookingStatus.BOOKED)
                .stream()
                .map(ScheduleBookingResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ScheduleBookingResponse> listByStudent(UUID studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Aluno nao encontrado.");
        }

        return bookingRepository.findAllByStudentIdAndStatusOrderByCreatedAtDesc(studentId, ScheduleBookingStatus.BOOKED)
                .stream()
                .map(ScheduleBookingResponse::from)
                .toList();
    }

    private ScheduleSlot validateCancelableBooking(UUID slotId, ScheduleBooking booking) {
        if (!booking.getSlotId().equals(slotId)) {
            throw new ResourceNotFoundException("Reserva nao pertence ao horario informado.");
        }

        if (booking.getStatus() != ScheduleBookingStatus.BOOKED) {
            throw new IllegalArgumentException("A reserva nao esta ativa.");
        }

        return slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Horario nao encontrado."));
    }

    private void validateSelfServiceWindow(OffsetDateTime slotStart, long minimumHours, String actionLabel) {
        OffsetDateTime limit = OffsetDateTime.now().plusHours(minimumHours);
        if (!slotStart.isAfter(limit)) {
            throw new IllegalArgumentException(
                    "Nao e possivel realizar " + actionLabel + " dentro da antecedencia minima configurada."
            );
        }
    }

    private void validateBookingOwnership(ScheduleBooking booking, UUID authenticatedStudentId) {
        if (!booking.getStudentId().equals(authenticatedStudentId)) {
            throw new IllegalArgumentException("A reserva nao pertence ao aluno autenticado.");
        }
    }
}
