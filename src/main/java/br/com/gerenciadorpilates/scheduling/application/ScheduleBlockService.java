package br.com.gerenciadorpilates.scheduling.application;

import br.com.gerenciadorpilates.identityaccess.domain.AppUser;
import br.com.gerenciadorpilates.identityaccess.domain.UserRole;
import br.com.gerenciadorpilates.identityaccess.infrastructure.AppUserRepository;
import br.com.gerenciadorpilates.platform.domain.ResourceNotFoundException;
import br.com.gerenciadorpilates.scheduling.api.CreateScheduleBlockRequest;
import br.com.gerenciadorpilates.scheduling.api.ScheduleBlockResponse;
import br.com.gerenciadorpilates.scheduling.domain.ScheduleBlock;
import br.com.gerenciadorpilates.scheduling.infrastructure.ScheduleBlockRepository;
import br.com.gerenciadorpilates.scheduling.infrastructure.ScheduleSlotRepository;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ScheduleBlockService {

    private final ScheduleBlockRepository blockRepository;
    private final ScheduleSlotRepository slotRepository;
    private final AppUserRepository userRepository;

    public ScheduleBlockService(
            ScheduleBlockRepository blockRepository,
            ScheduleSlotRepository slotRepository,
            AppUserRepository userRepository
    ) {
        this.blockRepository = blockRepository;
        this.slotRepository = slotRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ScheduleBlockResponse create(CreateScheduleBlockRequest request) {
        AppUser instructor = validateInstructor(request.instructorUserId());
        validateBlockWindow(request.startTime(), request.endTime());
        validateConflicts(null, instructor.getId(), request.startTime(), request.endTime());

        ScheduleBlock block = new ScheduleBlock(
                UUID.randomUUID(),
                instructor.getId(),
                instructor.getFullName(),
                request.startTime(),
                request.endTime(),
                request.reason().trim()
        );
        return ScheduleBlockResponse.from(blockRepository.save(block));
    }

    @Transactional
    public ScheduleBlockResponse update(UUID blockId, CreateScheduleBlockRequest request) {
        ScheduleBlock block = blockRepository.findById(blockId)
                .orElseThrow(() -> new ResourceNotFoundException("Bloqueio nao encontrado."));
        AppUser instructor = validateInstructor(request.instructorUserId());
        validateBlockWindow(request.startTime(), request.endTime());
        validateConflicts(blockId, instructor.getId(), request.startTime(), request.endTime());

        block.update(
                instructor.getId(),
                instructor.getFullName(),
                request.startTime(),
                request.endTime(),
                request.reason().trim()
        );
        return ScheduleBlockResponse.from(blockRepository.save(block));
    }

    @Transactional
    public void delete(UUID blockId) {
        ScheduleBlock block = blockRepository.findById(blockId)
                .orElseThrow(() -> new ResourceNotFoundException("Bloqueio nao encontrado."));
        blockRepository.delete(block);
    }

    private AppUser validateInstructor(UUID instructorUserId) {
        AppUser instructor = userRepository.findById(instructorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Instrutor nao encontrado."));

        if (instructor.getRole() != UserRole.INSTRUCTOR) {
            throw new IllegalArgumentException("O usuario informado nao possui perfil de instrutor.");
        }

        return instructor;
    }

    private void validateBlockWindow(OffsetDateTime startTime, OffsetDateTime endTime) {
        if (!endTime.isAfter(startTime)) {
            throw new IllegalArgumentException("O horario final do bloqueio deve ser maior que o inicial.");
        }
    }

    private void validateConflicts(
            UUID currentBlockId,
            UUID instructorUserId,
            OffsetDateTime startTime,
            OffsetDateTime endTime
    ) {
        boolean hasSlotConflict = !slotRepository.findOverlappingSlots(
                instructorUserId,
                startTime,
                endTime
        ).isEmpty();
        if (hasSlotConflict) {
            throw new IllegalArgumentException("Existem aulas neste intervalo. Remova ou remarque antes de bloquear.");
        }

        boolean hasBlockConflict = blockRepository.findOverlappingBlocks(
                        instructorUserId,
                        startTime,
                        endTime
                )
                .stream()
                .anyMatch(block -> !block.getId().equals(currentBlockId));
        if (hasBlockConflict) {
            throw new IllegalArgumentException("Ja existe um bloqueio conflitante para este instrutor.");
        }
    }

    @Transactional(readOnly = true)
    public List<ScheduleBlockResponse> listByDate(LocalDate date) {
        OffsetDateTime start = date.atStartOfDay().atOffset(OffsetDateTime.now().getOffset());
        OffsetDateTime end = date.atTime(23, 59, 59).atOffset(start.getOffset());

        return blockRepository.findAllByStartTimeBetweenOrderByStartTimeAsc(start, end)
                .stream()
                .map(ScheduleBlockResponse::from)
                .toList();
    }
}
