package br.com.gerenciadorpilates.scheduling.application;

import br.com.gerenciadorpilates.notifications.domain.NotificationChannel;
import br.com.gerenciadorpilates.notifications.domain.NotificationOutboxEntry;
import br.com.gerenciadorpilates.notifications.domain.NotificationStatus;
import br.com.gerenciadorpilates.notifications.infrastructure.NotificationOutboxRepository;
import br.com.gerenciadorpilates.platform.domain.ResourceNotFoundException;
import br.com.gerenciadorpilates.scheduling.api.WaitlistEntryResponse;
import br.com.gerenciadorpilates.scheduling.domain.ScheduleBooking;
import br.com.gerenciadorpilates.scheduling.domain.ScheduleBookingStatus;
import br.com.gerenciadorpilates.scheduling.domain.ScheduleSlot;
import br.com.gerenciadorpilates.scheduling.domain.ScheduleWaitlistEntry;
import br.com.gerenciadorpilates.scheduling.domain.WaitlistStatus;
import br.com.gerenciadorpilates.scheduling.infrastructure.ScheduleBookingRepository;
import br.com.gerenciadorpilates.scheduling.infrastructure.ScheduleSlotRepository;
import br.com.gerenciadorpilates.scheduling.infrastructure.ScheduleWaitlistEntryRepository;
import br.com.gerenciadorpilates.students.domain.Student;
import br.com.gerenciadorpilates.students.infrastructure.StudentRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ScheduleWaitlistService {

    private final ScheduleWaitlistEntryRepository waitlistRepository;
    private final ScheduleSlotRepository slotRepository;
    private final ScheduleBookingRepository bookingRepository;
    private final StudentRepository studentRepository;
    private final NotificationOutboxRepository notificationOutboxRepository;

    public ScheduleWaitlistService(
            ScheduleWaitlistEntryRepository waitlistRepository,
            ScheduleSlotRepository slotRepository,
            ScheduleBookingRepository bookingRepository,
            StudentRepository studentRepository,
            NotificationOutboxRepository notificationOutboxRepository
    ) {
        this.waitlistRepository = waitlistRepository;
        this.slotRepository = slotRepository;
        this.bookingRepository = bookingRepository;
        this.studentRepository = studentRepository;
        this.notificationOutboxRepository = notificationOutboxRepository;
    }

    @Transactional
    public WaitlistEntryResponse join(UUID slotId, UUID studentId) {
        ScheduleSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Horario nao encontrado."));
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Aluno nao encontrado."));

        if (slot.getBookedCount() < slot.getCapacity()) {
            throw new IllegalArgumentException("O horario ainda possui vaga. Reserve diretamente.");
        }

        bookingRepository.findBySlotIdAndStudentIdAndStatus(slotId, studentId, ScheduleBookingStatus.BOOKED)
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("O aluno ja possui reserva ativa neste horario.");
                });

        waitlistRepository.findBySlotIdAndStudentIdAndStatus(slotId, studentId, WaitlistStatus.WAITING)
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("O aluno ja esta na lista de espera deste horario.");
                });

        ScheduleWaitlistEntry entry = new ScheduleWaitlistEntry(
                UUID.randomUUID(),
                slotId,
                studentId,
                student.getFullName()
        );

        return WaitlistEntryResponse.from(waitlistRepository.save(entry));
    }

    @Transactional
    public WaitlistEntryResponse selfServiceJoin(UUID slotId, UUID studentId) {
        ScheduleSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Horario nao encontrado."));

        if (!slot.getStartTime().isAfter(java.time.OffsetDateTime.now())) {
            throw new IllegalArgumentException("Nao e possivel entrar na lista de espera de um horario que ja comecou ou passou.");
        }

        return join(slotId, studentId);
    }

    @Transactional(readOnly = true)
    public List<WaitlistEntryResponse> listBySlot(UUID slotId) {
        if (!slotRepository.existsById(slotId)) {
            throw new ResourceNotFoundException("Horario nao encontrado.");
        }

        return waitlistRepository.findAllBySlotIdAndStatusOrderByCreatedAtAsc(slotId, WaitlistStatus.WAITING)
                .stream()
                .map(WaitlistEntryResponse::from)
                .toList();
    }

    @Transactional
    public void promoteNextIfPossible(UUID slotId) {
        ScheduleSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Horario nao encontrado."));

        if (slot.getBookedCount() >= slot.getCapacity()) {
            return;
        }

        ScheduleWaitlistEntry entry = waitlistRepository.findFirstBySlotIdAndStatusOrderByCreatedAtAsc(slotId, WaitlistStatus.WAITING)
                .orElse(null);
        if (entry == null) {
            return;
        }

        if (bookingRepository.findBySlotIdAndStudentIdAndStatus(slotId, entry.getStudentId(), ScheduleBookingStatus.BOOKED).isPresent()) {
            entry.cancel();
            waitlistRepository.save(entry);
            return;
        }

        slot.incrementBookedCount();
        ScheduleBooking booking = new ScheduleBooking(
                UUID.randomUUID(),
                slotId,
                entry.getStudentId(),
                entry.getStudentName()
        );
        entry.promote();

        slotRepository.save(slot);
        bookingRepository.save(booking);
        waitlistRepository.save(entry);
        notificationOutboxRepository.save(new NotificationOutboxEntry(
                UUID.randomUUID(),
                NotificationChannel.WHATSAPP,
                NotificationStatus.PENDING,
                entry.getStudentId().toString(),
                "WAITLIST_PROMOTED",
                "{\"slotId\":\"%s\",\"studentId\":\"%s\"}".formatted(slotId, entry.getStudentId())
        ));
    }
}
