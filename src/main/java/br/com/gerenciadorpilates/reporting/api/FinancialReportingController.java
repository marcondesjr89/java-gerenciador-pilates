package br.com.gerenciadorpilates.reporting.api;

import br.com.gerenciadorpilates.reporting.application.DmedReportService;
import br.com.gerenciadorpilates.reporting.application.DreReportService;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/financial")
public class FinancialReportingController {

    private final DreReportService dreReportService;
    private final DmedReportService dmedReportService;

    public FinancialReportingController(DreReportService dreReportService, DmedReportService dmedReportService) {
        this.dreReportService = dreReportService;
        this.dmedReportService = dmedReportService;
    }

    @GetMapping("/dre")
    public DreSummaryResponse dre(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return dreReportService.summarize(startDate, endDate);
    }

    @GetMapping("/dmed/{baseYear}")
    public DmedAnnualReportResponse dmed(@PathVariable int baseYear) {
        return dmedReportService.generateAnnualReport(baseYear);
    }

    @GetMapping("/dmed/{baseYear}/csv")
    public ResponseEntity<String> dmedCsv(@PathVariable int baseYear) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=dmed-" + baseYear + ".csv")
                .contentType(new MediaType("text", "csv"))
                .body(dmedReportService.generateAnnualCsv(baseYear));
    }
}
