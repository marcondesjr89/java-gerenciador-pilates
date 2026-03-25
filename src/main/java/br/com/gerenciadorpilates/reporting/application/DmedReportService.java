package br.com.gerenciadorpilates.reporting.application;

import br.com.gerenciadorpilates.billing.domain.BillingPayment;
import br.com.gerenciadorpilates.billing.infrastructure.BillingPaymentRepository;
import br.com.gerenciadorpilates.platform.config.ApplicationProperties;
import br.com.gerenciadorpilates.reporting.api.DmedAnnualReportResponse;
import br.com.gerenciadorpilates.reporting.api.DmedStudentSummaryResponse;
import br.com.gerenciadorpilates.students.infrastructure.StudentRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DmedReportService {

    private final BillingPaymentRepository paymentRepository;
    private final StudentRepository studentRepository;
    private final DmedProperties dmedProperties;
    private final ApplicationProperties applicationProperties;

    public DmedReportService(
            BillingPaymentRepository paymentRepository,
            StudentRepository studentRepository,
            DmedProperties dmedProperties,
            ApplicationProperties applicationProperties
    ) {
        this.paymentRepository = paymentRepository;
        this.studentRepository = studentRepository;
        this.dmedProperties = dmedProperties;
        this.applicationProperties = applicationProperties;
    }

    @Transactional(readOnly = true)
    public DmedAnnualReportResponse generateAnnualReport(int baseYear) {
        ensureProviderConfigured();
        LocalDate startDate = LocalDate.of(baseYear, 1, 1);
        LocalDate endDate = LocalDate.of(baseYear, 12, 31);
        OffsetDateTime periodStart = startDate.atStartOfDay(ZoneId.of(applicationProperties.timezone())).toOffsetDateTime();
        OffsetDateTime periodEnd = endDate.atTime(LocalTime.MAX).atZone(ZoneId.of(applicationProperties.timezone())).toOffsetDateTime();

        List<BillingPayment> payments = paymentRepository.findAllByPaidAtBetweenOrderByPaidAtAsc(periodStart, periodEnd);
        Map<UUID, BigDecimal> totalsByStudent = new LinkedHashMap<>();
        for (BillingPayment payment : payments) {
            totalsByStudent.merge(payment.getStudentId(), payment.getAmountPaid(), BigDecimal::add);
        }

        Map<UUID, br.com.gerenciadorpilates.students.domain.Student> studentsById = studentRepository.findAllById(totalsByStudent.keySet())
                .stream()
                .collect(Collectors.toMap(student -> student.getId(), student -> student));

        List<DmedStudentSummaryResponse> students = totalsByStudent.entrySet()
                .stream()
                .map(entry -> {
                    var student = studentsById.get(entry.getKey());
                    if (student == null) {
                        return null;
                    }
                    return new DmedStudentSummaryResponse(
                            student.getId(),
                            student.getFullName(),
                            student.getCpf(),
                            entry.getValue()
                    );
                })
                .filter(java.util.Objects::nonNull)
                .sorted(Comparator.comparing(DmedStudentSummaryResponse::studentName))
                .toList();

        return new DmedAnnualReportResponse(
                baseYear,
                dmedProperties.providerName(),
                dmedProperties.providerCnpj(),
                students
        );
    }

    public String generateAnnualCsv(int baseYear) {
        DmedAnnualReportResponse report = generateAnnualReport(baseYear);
        StringBuilder csv = new StringBuilder();
        csv.append("baseYear;providerName;providerCnpj;studentName;cpf;totalPaid\n");
        for (DmedStudentSummaryResponse student : report.students()) {
            csv.append(report.baseYear()).append(';')
                    .append(escape(report.providerName())).append(';')
                    .append(escape(report.providerCnpj())).append(';')
                    .append(escape(student.studentName())).append(';')
                    .append(escape(student.cpf())).append(';')
                    .append(student.totalPaid()).append('\n');
        }
        return csv.toString();
    }

    private void ensureProviderConfigured() {
        if (dmedProperties.providerName() == null || dmedProperties.providerName().isBlank()
                || dmedProperties.providerCnpj() == null || dmedProperties.providerCnpj().isBlank()) {
            throw new IllegalArgumentException("Configure providerName e providerCnpj para exportar a DMED.");
        }
    }

    private String escape(String value) {
        return '"' + value.replace("\"", "\"\"") + '"';
    }
}
