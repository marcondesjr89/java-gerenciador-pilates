package br.com.gerenciadorpilates.reporting.application;

import br.com.gerenciadorpilates.platform.config.ApplicationProperties;
import br.com.gerenciadorpilates.platform.domain.ResourceNotFoundException;
import br.com.gerenciadorpilates.reporting.api.CommissionReportResponse;
import br.com.gerenciadorpilates.reporting.domain.InstructorCommissionProfile;
import br.com.gerenciadorpilates.reporting.infrastructure.InstructorCommissionProfileRepository;
import br.com.gerenciadorpilates.scheduling.domain.ScheduleBookingStatus;
import br.com.gerenciadorpilates.scheduling.infrastructure.ScheduleBookingRepository;
import br.com.gerenciadorpilates.scheduling.infrastructure.ScheduleSlotRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommissionReportService {

    private final InstructorCommissionProfileRepository profileRepository;
    private final ScheduleSlotRepository scheduleSlotRepository;
    private final ScheduleBookingRepository scheduleBookingRepository;
    private final ApplicationProperties applicationProperties;

    public CommissionReportService(
            InstructorCommissionProfileRepository profileRepository,
            ScheduleSlotRepository scheduleSlotRepository,
            ScheduleBookingRepository scheduleBookingRepository,
            ApplicationProperties applicationProperties
    ) {
        this.profileRepository = profileRepository;
        this.scheduleSlotRepository = scheduleSlotRepository;
        this.scheduleBookingRepository = scheduleBookingRepository;
        this.applicationProperties = applicationProperties;
    }

    @Transactional(readOnly = true)
    public List<CommissionReportResponse> report(LocalDate startDate, LocalDate endDate, UUID instructorUserId) {
        validateRange(startDate, endDate);
        List<InstructorCommissionProfile> profiles = instructorUserId == null
                ? profileRepository.findAllByActiveTrueOrderByInstructorNameAsc()
                : List.of(profileRepository.findByInstructorUserId(instructorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil de comissao nao encontrado.")));

        return profiles.stream()
                .filter(InstructorCommissionProfile::isActive)
                .map(profile -> buildResponse(profile, startDate, endDate))
                .toList();
    }

    private CommissionReportResponse buildResponse(InstructorCommissionProfile profile, LocalDate startDate, LocalDate endDate) {
        OffsetDateTime periodStart = startDate.atStartOfDay(ZoneId.of(applicationProperties.timezone())).toOffsetDateTime();
        OffsetDateTime periodEnd = endDate.atTime(LocalTime.MAX).atZone(ZoneId.of(applicationProperties.timezone())).toOffsetDateTime();

        List<UUID> slotIds = scheduleSlotRepository.findAllByInstructorUserIdAndStartTimeBetweenOrderByStartTimeAsc(
                        profile.getInstructorUserId(),
                        periodStart,
                        periodEnd
                )
                .stream()
                .map(slot -> slot.getId())
                .toList();

        long quantity = switch (profile.getCommissionModel()) {
            case PER_CLASS -> slotIds.size();
            case PER_STUDENT_BOOKING -> slotIds.isEmpty()
                    ? 0L
                    : scheduleBookingRepository.countBySlotIdInAndStatus(slotIds, ScheduleBookingStatus.BOOKED);
        };

        return new CommissionReportResponse(
                profile.getInstructorUserId(),
                profile.getInstructorName(),
                profile.getCommissionModel(),
                profile.getUnitAmount(),
                quantity,
                profile.getUnitAmount().multiply(BigDecimal.valueOf(quantity)),
                startDate,
                endDate
        );
    }

    private void validateRange(LocalDate startDate, LocalDate endDate) {
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("A data final deve ser maior ou igual a data inicial.");
        }
    }
}
