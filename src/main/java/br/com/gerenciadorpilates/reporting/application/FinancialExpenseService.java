package br.com.gerenciadorpilates.reporting.application;

import br.com.gerenciadorpilates.reporting.api.CreateFinancialExpenseRequest;
import br.com.gerenciadorpilates.reporting.api.FinancialExpenseResponse;
import br.com.gerenciadorpilates.reporting.domain.FinancialExpense;
import br.com.gerenciadorpilates.reporting.infrastructure.FinancialExpenseRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FinancialExpenseService {

    private final FinancialExpenseRepository expenseRepository;

    public FinancialExpenseService(FinancialExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    @Transactional
    public FinancialExpenseResponse create(CreateFinancialExpenseRequest request) {
        FinancialExpense expense = new FinancialExpense(
                UUID.randomUUID(),
                request.description().trim(),
                request.expenseType(),
                request.amount(),
                request.occurredOn()
        );
        return FinancialExpenseResponse.from(expenseRepository.save(expense));
    }

    @Transactional(readOnly = true)
    public List<FinancialExpenseResponse> list(LocalDate startDate, LocalDate endDate) {
        return expenseRepository.findAllByOccurredOnBetweenOrderByOccurredOnAsc(startDate, endDate)
                .stream()
                .map(FinancialExpenseResponse::from)
                .toList();
    }
}
