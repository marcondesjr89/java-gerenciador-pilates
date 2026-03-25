package br.com.gerenciadorpilates.reporting.api;

import br.com.gerenciadorpilates.reporting.application.FinancialExpenseService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
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
@RequestMapping("/api/v1/financial/expenses")
public class FinancialExpenseController {

    private final FinancialExpenseService expenseService;

    public FinancialExpenseController(FinancialExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FinancialExpenseResponse create(@Valid @RequestBody CreateFinancialExpenseRequest request) {
        return expenseService.create(request);
    }

    @GetMapping
    public List<FinancialExpenseResponse> list(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return expenseService.list(startDate, endDate);
    }
}
