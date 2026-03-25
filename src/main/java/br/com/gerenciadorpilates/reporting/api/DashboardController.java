package br.com.gerenciadorpilates.reporting.api;

import br.com.gerenciadorpilates.reporting.application.DashboardKpiService;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardKpiService dashboardKpiService;

    public DashboardController(DashboardKpiService dashboardKpiService) {
        this.dashboardKpiService = dashboardKpiService;
    }

    @GetMapping("/kpis")
    public DashboardKpiResponse kpis(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return dashboardKpiService.summarize(startDate, endDate);
    }
}
