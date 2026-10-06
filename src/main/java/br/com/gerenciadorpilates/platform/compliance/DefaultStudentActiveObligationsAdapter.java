package br.com.gerenciadorpilates.platform.compliance;

import br.com.gerenciadorpilates.billing.domain.InvoiceStatus;
import br.com.gerenciadorpilates.billing.domain.SubscriptionStatus;
import br.com.gerenciadorpilates.billing.infrastructure.BillingInvoiceRepository;
import br.com.gerenciadorpilates.billing.infrastructure.StudentSubscriptionRepository;
import br.com.gerenciadorpilates.scheduling.domain.ScheduleBookingStatus;
import br.com.gerenciadorpilates.scheduling.domain.WaitlistStatus;
import br.com.gerenciadorpilates.scheduling.infrastructure.ScheduleBookingRepository;
import br.com.gerenciadorpilates.scheduling.infrastructure.ScheduleWaitlistEntryRepository;
import br.com.gerenciadorpilates.students.application.StudentActiveObligationsPort;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class DefaultStudentActiveObligationsAdapter implements StudentActiveObligationsPort {

    private final ScheduleBookingRepository bookingRepository;
    private final ScheduleWaitlistEntryRepository waitlistEntryRepository;
    private final StudentSubscriptionRepository subscriptionRepository;
    private final BillingInvoiceRepository invoiceRepository;

    public DefaultStudentActiveObligationsAdapter(
            ScheduleBookingRepository bookingRepository,
            ScheduleWaitlistEntryRepository waitlistEntryRepository,
            StudentSubscriptionRepository subscriptionRepository,
            BillingInvoiceRepository invoiceRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.waitlistEntryRepository = waitlistEntryRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.invoiceRepository = invoiceRepository;
    }

    @Override
    public List<String> getBlockingReasons(UUID studentId) {
        List<String> obligations = new ArrayList<>();

        var activeBookings = bookingRepository.findAllByStudentIdAndStatusOrderByCreatedAtDesc(studentId, ScheduleBookingStatus.BOOKED);
        if (!activeBookings.isEmpty()) {
            obligations.add("Possui " + activeBookings.size() + " reserva(s) ativa(s) na agenda");
        }

        var activeWaitlist = waitlistEntryRepository.findAllByStudentIdAndStatus(studentId, WaitlistStatus.WAITING);
        if (!activeWaitlist.isEmpty()) {
            obligations.add("Possui " + activeWaitlist.size() + " inscrição(ões) ativa(s) na lista de espera");
        }

        var activeSubscription = subscriptionRepository.findByStudentIdAndStatus(studentId, SubscriptionStatus.ACTIVE);
        if (activeSubscription.isPresent()) {
            obligations.add("Possui assinatura de plano ativa");
        }

        var openInvoices = invoiceRepository.findAllByStudentIdAndStatus(studentId, InvoiceStatus.OPEN);
        if (!openInvoices.isEmpty()) {
            obligations.add("Possui " + openInvoices.size() + " fatura(s) em aberto");
        }

        return obligations;
    }
}
