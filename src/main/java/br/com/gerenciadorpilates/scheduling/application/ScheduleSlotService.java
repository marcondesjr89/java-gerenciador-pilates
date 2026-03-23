package br.com.gerenciadorpilates.scheduling.application;

import br.com.gerenciadorpilates.identityaccess.domain.AppUser;
import br.com.gerenciadorpilates.identityaccess.domain.UserRole;
import br.com.gerenciadorpilates.identityaccess.infrastructure.AppUserRepository;
import br.com.gerenciadorpilates.platform.domain.ResourceNotFoundException;
import br.com.gerenciadorpilates.scheduling.api.CreateScheduleSlotRequest;
import br.com.gerenciadorpilates.scheduling.api.ScheduleSlotResponse;
import br.com.gerenciadorpilates.scheduling.domain.ScheduleSlot;
import br.com.gerenciadorpilates.scheduling.infrastructure.ScheduleSlotRepository;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ScheduleSlotService {

    private final ScheduleSlotRepository slotRepository;
    private final AppUserRepository userRepository;

    public ScheduleSlotService(ScheduleSlotRepository slotRepository, AppUserRepository userRepository) {
        this.slotRepository = slotRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ScheduleSlotResponse create(CreateScheduleSlotRequest request) {
        if (!request.endTime().isAfter(request.startTime())) {
            throw new IllegalArgumentException("O horario final deve ser maior que o horario inicial.");
        }

        AppUser instructor = userRepository.findById(request.instructorUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Instrutor nao encontrado."));

        if (instructor.getRole() != UserRole.INSTRUCTOR) {
            throw new IllegalArgumentException("O usuario informado nao possui perfil de instrutor.");
        }

        boolean hasConflict = !slotRepository.findOverlappingSlots(
                request.instructorUserId(),
                request.startTime(),
                request.endTime()
        ).isEmpty();

        if (hasConflict) {
            throw new IllegalArgumentException("Ja existe um horario conflitante para este instrutor.");
        }

        ScheduleSlot slot = new ScheduleSlot(
                UUID.randomUUID(),
                instructor.getId(),
                instructor.getFullName(),
                request.startTime(),
                request.endTime(),
                request.capacity()
        );

        return ScheduleSlotResponse.from(slotRepository.save(slot));
    }

    @Transactional(readOnly = true)
    public List<ScheduleSlotResponse> listByDate(LocalDate date) {
        OffsetDateTime start = date.atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime end = start.plusDays(1);
        return slotRepository.findAllByStartTimeBetweenOrderByStartTimeAsc(start, end)
                .stream()
                .map(ScheduleSlotResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ScheduleSlot getEntityById(UUID slotId) {
        return slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Horario nao encontrado."));
    }
}
