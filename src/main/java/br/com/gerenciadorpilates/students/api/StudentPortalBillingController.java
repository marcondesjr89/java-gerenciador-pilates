package br.com.gerenciadorpilates.students.api;

import br.com.gerenciadorpilates.billing.application.BillingInvoiceService;
import br.com.gerenciadorpilates.billing.application.StudentSubscriptionService;
import br.com.gerenciadorpilates.platform.security.AuthenticatedActor;
import br.com.gerenciadorpilates.platform.security.SecurityActorUtils;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/student-portal/me/billing")
public class StudentPortalBillingController {

    private final StudentSubscriptionService subscriptionService;
    private final BillingInvoiceService invoiceService;

    public StudentPortalBillingController(
            StudentSubscriptionService subscriptionService,
            BillingInvoiceService invoiceService
    ) {
        this.subscriptionService = subscriptionService;
        this.invoiceService = invoiceService;
    }

    @GetMapping
    public StudentPortalBillingOverviewResponse overview(Authentication authentication) {
        AuthenticatedActor actor = SecurityActorUtils.requireActor(authentication);
        return new StudentPortalBillingOverviewResponse(
                subscriptionService.listByStudent(actor.principalId()),
                invoiceService.listByStudent(actor.principalId())
        );
    }
}
