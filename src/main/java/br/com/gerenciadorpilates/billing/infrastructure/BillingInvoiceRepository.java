package br.com.gerenciadorpilates.billing.infrastructure;

import br.com.gerenciadorpilates.billing.domain.BillingInvoice;
import br.com.gerenciadorpilates.billing.domain.InvoiceStatus;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillingInvoiceRepository extends JpaRepository<BillingInvoice, UUID> {

    Optional<BillingInvoice> findBySubscriptionIdAndReferenceMonthAndStatus(
            UUID subscriptionId,
            LocalDate referenceMonth,
            InvoiceStatus status
    );

    List<BillingInvoice> findAllByStatusAndDueDateBeforeOrderByDueDateAsc(InvoiceStatus status, LocalDate dueDate);

    List<BillingInvoice> findAllByStudentIdOrderByReferenceMonthDesc(UUID studentId);
}
