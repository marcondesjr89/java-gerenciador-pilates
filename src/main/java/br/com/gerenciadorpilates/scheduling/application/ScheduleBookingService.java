package br.com.gerenciadorpilates.scheduling.application;

import br.com.gerenciadorpilates.platform.domain.ResourceNotFoundException;
import br.com.gerenciadorpilates.scheduling.api.ScheduleBookingResponse;
import br.com.gerenciadorpilates.scheduling.domain.ScheduleBooking;
import br.com.gerenciadorpilates.scheduling.domain.ScheduleBookingStatus;
import br.com.gerenciadorpilates.scheduling.domain.ScheduleSlot;
import br.com.gerenciadorpilates.scheduling.infrastructure.ScheduleBookingRepository;
import br.com.gerenciadorpilates.scheduling.infrastructure.ScheduleSlotRepository;
import br.com.gerenciadorpilates.students.domain.Student;
import br.com.gerenciadorpilates.students.infrastructure.StudentRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ScheduleBookingService {

    private final ScheduleBookingRepository bookingRepository;
    private final ScheduleSlotRepository slotRepository;
    private final StudentRepository studentRepository;

    public ScheduleBookingService(
            ScheduleBookingRepository bookingRepository,
            ScheduleSlotRepository slotRepository,
            StudentRepository studentRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.slotRepository = slotRepository;
        this.studentRepository = studentRepository;
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
}
