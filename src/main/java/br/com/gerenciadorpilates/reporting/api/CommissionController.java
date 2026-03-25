package br.com.gerenciadorpilates.reporting.api;

import br.com.gerenciadorpilates.reporting.application.CommissionProfileService;
import br.com.gerenciadorpilates.reporting.application.CommissionReportService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/financial/commissions")
public class CommissionController {

    private final CommissionProfileService commissionProfileService;
    private final CommissionReportService commissionReportService;

    public CommissionController(
            CommissionProfileService commissionProfileService,
            CommissionReportService commissionReportService
    ) {
        this.commissionProfileService = commissionProfileService;
        this.commissionReportService = commissionReportService;
    }

    @PostMapping("/profiles")
    @ResponseStatus(HttpStatus.CREATED)
    public InstructorCommissionProfileResponse upsertProfile(
            @Valid @RequestBody UpsertInstructorCommissionProfileRequest request
    ) {
        return commissionProfileService.upsert(request);
    }

    @GetMapping("/profiles")
    public List<InstructorCommissionProfileResponse> listProfiles() {
        return commissionProfileService.list();
    }

    @GetMapping("/reports")
    public List<CommissionReportResponse> report(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) UUID instructorUserId
    ) {
        return commissionReportService.report(startDate, endDate, instructorUserId);
    }
}
