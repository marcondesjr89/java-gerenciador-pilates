package br.com.gerenciadorpilates.reporting.infrastructure;

import br.com.gerenciadorpilates.reporting.domain.FinancialExpense;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FinancialExpenseRepository extends JpaRepository<FinancialExpense, UUID> {

    List<FinancialExpense> findAllByOccurredOnBetweenOrderByOccurredOnAsc(LocalDate startDate, LocalDate endDate);
}
