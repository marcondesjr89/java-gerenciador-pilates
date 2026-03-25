package br.com.gerenciadorpilates.billing.application;

import br.com.gerenciadorpilates.billing.api.BillingInvoiceResponse;
import br.com.gerenciadorpilates.billing.api.GenerateInvoiceRequest;
import br.com.gerenciadorpilates.billing.domain.BillingInvoice;
import br.com.gerenciadorpilates.billing.domain.BillingPlan;
import br.com.gerenciadorpilates.billing.domain.InvoiceStatus;
import br.com.gerenciadorpilates.billing.domain.StudentSubscription;
import br.com.gerenciadorpilates.billing.domain.SubscriptionStatus;
import br.com.gerenciadorpilates.billing.infrastructure.BillingInvoiceRepository;
import br.com.gerenciadorpilates.billing.infrastructure.BillingPlanRepository;
import br.com.gerenciadorpilates.billing.infrastructure.StudentSubscriptionRepository;
import br.com.gerenciadorpilates.platform.domain.ResourceNotFoundException;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BillingInvoiceService {

    private final BillingInvoiceRepository invoiceRepository;
    private final StudentSubscriptionRepository subscriptionRepository;
    private final BillingPlanRepository planRepository;

    public BillingInvoiceService(
            BillingInvoiceRepository invoiceRepository,
            StudentSubscriptionRepository subscriptionRepository,
            BillingPlanRepository planRepository
    ) {
        this.invoiceRepository = invoiceRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.planRepository = planRepository;
    }

    @Transactional
    public BillingInvoiceResponse generate(GenerateInvoiceRequest request) {
        StudentSubscription subscription = subscriptionRepository.findById(request.subscriptionId())
                .orElseThrow(() -> new ResourceNotFoundException("Assinatura nao encontrada."));

        if (subscription.getStatus() != SubscriptionStatus.ACTIVE) {
            throw new IllegalArgumentException("Nao e possivel gerar fatura para assinatura inativa.");
        }

        BillingPlan plan = planRepository.findById(subscription.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Plano da assinatura nao encontrado."));

        LocalDate referenceMonth = subscription.getNextBillingDate().withDayOfMonth(1);
        invoiceRepository.findBySubscriptionIdAndReferenceMonthAndStatus(subscription.getId(), referenceMonth, InvoiceStatus.OPEN)
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Ja existe fatura aberta para a competencia informada.");
                });

        BillingInvoice invoice = new BillingInvoice(
                UUID.randomUUID(),
                subscription.getStudentId(),
                subscription.getStudentName(),
                subscription.getId(),
                referenceMonth,
                request.dueDate(),
                plan.getPriceAmount()
        );

        subscription.advanceNextBillingDate(plan.getBillingCycleMonths());
        subscriptionRepository.save(subscription);
        return BillingInvoiceResponse.from(invoiceRepository.save(invoice));
    }

    @Transactional(readOnly = true)
    public List<BillingInvoiceResponse> listOverdue(LocalDate baseDate) {
        LocalDate today = baseDate == null ? LocalDate.now() : baseDate;
        return invoiceRepository.findAllByStatusAndDueDateBeforeOrderByDueDateAsc(InvoiceStatus.OPEN, today)
                .stream()
                .map(BillingInvoiceResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BillingInvoiceResponse> listByStudent(UUID studentId) {
        return invoiceRepository.findAllByStudentIdOrderByReferenceMonthDesc(studentId)
                .stream()
                .map(BillingInvoiceResponse::from)
                .toList();
    }

    @Transactional
    public BillingInvoice markAsPaid(UUID invoiceId, java.time.OffsetDateTime paidAt) {
        BillingInvoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Fatura nao encontrada."));
        if (invoice.getStatus() != InvoiceStatus.OPEN) {
            throw new IllegalArgumentException("A fatura informada nao esta em aberto.");
        }
        invoice.markAsPaid(paidAt);
        return invoiceRepository.save(invoice);
    }
}
