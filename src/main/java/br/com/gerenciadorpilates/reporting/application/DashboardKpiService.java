package br.com.gerenciadorpilates.reporting.application;

import br.com.gerenciadorpilates.billing.domain.InvoiceStatus;
import br.com.gerenciadorpilates.billing.infrastructure.BillingInvoiceRepository;
import br.com.gerenciadorpilates.reporting.api.DashboardKpiResponse;
import br.com.gerenciadorpilates.reporting.api.KpiValueResponse;
import br.com.gerenciadorpilates.scheduling.infrastructure.ScheduleSlotRepository;
import br.com.gerenciadorpilates.students.domain.StudentStatus;
import br.com.gerenciadorpilates.students.infrastructure.StudentRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardKpiService {

    private final StudentRepository studentRepository;
    private final ScheduleSlotRepository scheduleSlotRepository;
    private final BillingInvoiceRepository billingInvoiceRepository;
    private final br.com.gerenciadorpilates.platform.config.ApplicationProperties applicationProperties;

    public DashboardKpiService(
            StudentRepository studentRepository,
            ScheduleSlotRepository scheduleSlotRepository,
            BillingInvoiceRepository billingInvoiceRepository,
            br.com.gerenciadorpilates.platform.config.ApplicationProperties applicationProperties
    ) {
        this.studentRepository = studentRepository;
        this.scheduleSlotRepository = scheduleSlotRepository;
        this.billingInvoiceRepository = billingInvoiceRepository;
        this.applicationProperties = applicationProperties;
    }

    @Transactional(readOnly = true)
    public DashboardKpiResponse summarize(LocalDate startDate, LocalDate endDate) {
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("A data final deve ser maior ou igual a data inicial.");
        }

        BigDecimal churnRate = calculateChurnRate();
        BigDecimal occupancyRate = calculateOccupancyRate(startDate, endDate);
        BigDecimal delinquencyRate = calculateDelinquencyRate(startDate, endDate);

        return new DashboardKpiResponse(
                startDate,
                endDate,
                List.of(
                        new KpiValueResponse(
                                "churnRate",
                                "Churn Rate",
                                churnRate,
                                "PERCENT",
                                "Percentual atual de alunos inativos sobre a base de alunos ativos e inativos."
                        ),
                        new KpiValueResponse(
                                "occupancyRate",
                                "Taxa de Ocupacao",
                                occupancyRate,
                                "PERCENT",
                                "Percentual de vagas preenchidas nos horarios do periodo informado."
                        ),
                        new KpiValueResponse(
                                "delinquencyRate",
                                "Inadimplencia",
                                delinquencyRate,
                                "PERCENT",
                                "Percentual de faturas vencidas e ainda em aberto entre as faturas com vencimento no periodo."
                        )
                )
        );
    }

    private BigDecimal calculateChurnRate() {
        long activeStudents = studentRepository.countByStatus(StudentStatus.ACTIVE);
        long inactiveStudents = studentRepository.countByStatus(StudentStatus.INACTIVE);
        long base = activeStudents + inactiveStudents;
        if (base == 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return percentage(inactiveStudents, base);
    }

    private BigDecimal calculateOccupancyRate(LocalDate startDate, LocalDate endDate) {
        OffsetDateTime periodStart = startDate.atStartOfDay(ZoneId.of(applicationProperties.timezone())).toOffsetDateTime();
        OffsetDateTime periodEnd = endDate.atTime(LocalTime.MAX).atZone(ZoneId.of(applicationProperties.timezone())).toOffsetDateTime();
        var slots = scheduleSlotRepository.findAllByStartTimeBetweenOrderByStartTimeAsc(periodStart, periodEnd);
        int totalCapacity = slots.stream().mapToInt(slot -> slot.getCapacity()).sum();
        int totalBooked = slots.stream().mapToInt(slot -> slot.getBookedCount()).sum();
        if (totalCapacity == 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return percentage(totalBooked, totalCapacity);
    }

    private BigDecimal calculateDelinquencyRate(LocalDate startDate, LocalDate endDate) {
        var invoices = billingInvoiceRepository.findAllByDueDateBetweenOrderByDueDateAsc(startDate, endDate);
        if (invoices.isEmpty()) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        long overdueOpen = invoices.stream()
                .filter(invoice -> invoice.getStatus() == InvoiceStatus.OPEN)
                .count();
        return percentage(overdueOpen, invoices.size());
    }

    private BigDecimal percentage(long numerator, long denominator) {
        return BigDecimal.valueOf(numerator)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(denominator), 2, RoundingMode.HALF_UP);
    }
}
