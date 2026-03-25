package br.com.gerenciadorpilates.billing.infrastructure;

import br.com.gerenciadorpilates.billing.domain.BillingPayment;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillingPaymentRepository extends JpaRepository<BillingPayment, UUID> {

    List<BillingPayment> findAllByInvoiceIdOrderByPaidAtDesc(UUID invoiceId);
}
