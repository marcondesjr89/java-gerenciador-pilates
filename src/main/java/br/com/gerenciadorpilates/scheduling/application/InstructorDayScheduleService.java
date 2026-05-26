package br.com.gerenciadorpilates.scheduling.application;

import br.com.gerenciadorpilates.clinical.domain.StudentAnamnesis;
import br.com.gerenciadorpilates.clinical.domain.StudentProgressEntry;
import br.com.gerenciadorpilates.clinical.infrastructure.StudentAnamnesisRepository;
import br.com.gerenciadorpilates.clinical.infrastructure.StudentProgressEntryRepository;
import br.com.gerenciadorpilates.scheduling.api.InstructorDayBookingResponse;
import br.com.gerenciadorpilates.scheduling.api.InstructorDayClinicalSummaryResponse;
import br.com.gerenciadorpilates.scheduling.api.InstructorDayScheduleResponse;
import br.com.gerenciadorpilates.scheduling.api.InstructorDaySlotResponse;
import br.com.gerenciadorpilates.scheduling.domain.ScheduleBooking;
import br.com.gerenciadorpilates.scheduling.domain.ScheduleBookingStatus;
import br.com.gerenciadorpilates.scheduling.infrastructure.ScheduleBookingRepository;
import br.com.gerenciadorpilates.scheduling.infrastructure.ScheduleSlotRepository;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InstructorDayScheduleService {

    private final ScheduleSlotRepository slotRepository;
    private final ScheduleBookingRepository bookingRepository;
    private final StudentAnamnesisRepository anamnesisRepository;
    private final StudentProgressEntryRepository progressEntryRepository;

    public InstructorDayScheduleService(
            ScheduleSlotRepository slotRepository,
            ScheduleBookingRepository bookingRepository,
            StudentAnamnesisRepository anamnesisRepository,
            StudentProgressEntryRepository progressEntryRepository
    ) {
        this.slotRepository = slotRepository;
        this.bookingRepository = bookingRepository;
        this.anamnesisRepository = anamnesisRepository;
        this.progressEntryRepository = progressEntryRepository;
    }

    @Transactional(readOnly = true)
    public InstructorDayScheduleResponse getDaySchedule(UUID instructorUserId, LocalDate date) {
        OffsetDateTime start = date.atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime end = start.plusDays(1);
        var slots = slotRepository.findAllByInstructorUserIdAndStartTimeBetweenOrderByStartTimeAsc(
                instructorUserId,
                start,
                end
        );
        List<UUID> slotIds = slots.stream().map(slot -> slot.getId()).toList();
        List<ScheduleBooking> bookings = slotIds.isEmpty()
                ? List.of()
                : bookingRepository.findAllBySlotIdInAndStatusOrderByCreatedAtAsc(slotIds, ScheduleBookingStatus.BOOKED);
        Map<UUID, List<ScheduleBooking>> bookingsBySlotId = bookings.stream()
                .collect(Collectors.groupingBy(ScheduleBooking::getSlotId));
        List<UUID> studentIds = bookings.stream()
                .map(ScheduleBooking::getStudentId)
                .distinct()
                .toList();
        Map<UUID, StudentAnamnesis> anamnesisByStudentId = loadAnamnesisByStudentId(studentIds);
        Map<UUID, StudentProgressEntry> latestEntryByStudentId = loadLatestEntryByStudentId(studentIds);

        List<InstructorDaySlotResponse> slotResponses = slots.stream()
                .map(slot -> InstructorDaySlotResponse.from(
                        slot,
                        bookingsBySlotId.getOrDefault(slot.getId(), List.of())
                                .stream()
                                .map(booking -> InstructorDayBookingResponse.from(
                                        booking,
                                        InstructorDayClinicalSummaryResponse.from(
                                                booking.getStudentId(),
                                                anamnesisByStudentId.get(booking.getStudentId()),
                                                latestEntryByStudentId.get(booking.getStudentId())
                                        )
                                ))
                                .toList()
                ))
                .toList();

        return new InstructorDayScheduleResponse(
                instructorUserId,
                date,
                slotResponses.size(),
                bookings.size(),
                slotResponses
        );
    }

    private Map<UUID, StudentAnamnesis> loadAnamnesisByStudentId(List<UUID> studentIds) {
        if (studentIds.isEmpty()) {
            return Map.of();
        }

        return anamnesisRepository.findAllByStudentIdIn(studentIds)
                .stream()
                .collect(Collectors.toMap(StudentAnamnesis::getStudentId, Function.identity()));
    }

    private Map<UUID, StudentProgressEntry> loadLatestEntryByStudentId(List<UUID> studentIds) {
        if (studentIds.isEmpty()) {
            return Map.of();
        }

        return progressEntryRepository.findAllByStudentIdInOrderByStudentIdAscRecordedAtDesc(studentIds)
                .stream()
                .collect(Collectors.toMap(
                        StudentProgressEntry::getStudentId,
                        Function.identity(),
                        (latest, ignored) -> latest
                ));
    }
}
