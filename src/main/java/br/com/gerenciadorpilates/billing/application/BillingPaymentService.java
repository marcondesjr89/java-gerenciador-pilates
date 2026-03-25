package br.com.gerenciadorpilates.billing.application;

import br.com.gerenciadorpilates.billing.api.BillingPaymentResponse;
import br.com.gerenciadorpilates.billing.api.RegisterPaymentRequest;
import br.com.gerenciadorpilates.billing.domain.BillingInvoice;
import br.com.gerenciadorpilates.billing.domain.BillingPayment;
import br.com.gerenciadorpilates.billing.infrastructure.BillingPaymentRepository;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BillingPaymentService {

    private final BillingInvoiceService invoiceService;
    private final BillingPaymentRepository paymentRepository;

    public BillingPaymentService(BillingInvoiceService invoiceService, BillingPaymentRepository paymentRepository) {
        this.invoiceService = invoiceService;
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    public BillingPaymentResponse register(UUID invoiceId, RegisterPaymentRequest request) {
        BillingInvoice invoice = invoiceService.markAsPaid(invoiceId, request.paidAt());
        if (request.amountPaid().compareTo(invoice.getAmountDue()) != 0) {
            throw new IllegalArgumentException("O valor do pagamento deve ser igual ao valor da fatura neste MVP.");
        }

        BillingPayment payment = new BillingPayment(
                UUID.randomUUID(),
                invoice.getId(),
                invoice.getStudentId(),
                request.amountPaid(),
                request.paymentMethod(),
                request.paidAt(),
                request.externalReference()
        );
        return BillingPaymentResponse.from(paymentRepository.save(payment));
    }
}
