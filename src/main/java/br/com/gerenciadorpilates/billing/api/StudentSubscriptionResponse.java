package br.com.gerenciadorpilates.billing.api;

import br.com.gerenciadorpilates.billing.domain.StudentSubscription;
import br.com.gerenciadorpilates.billing.domain.SubscriptionStatus;
import java.time.LocalDate;
import java.util.UUID;

public record StudentSubscriptionResponse(
        UUID id,
        UUID studentId,
        String studentName,
        UUID planId,
        String planName,
        SubscriptionStatus status,
        LocalDate startDate,
        LocalDate nextBillingDate
) {

    public static StudentSubscriptionResponse from(StudentSubscription subscription) {
        return new StudentSubscriptionResponse(
                subscription.getId(),
                subscription.getStudentId(),
                subscription.getStudentName(),
                subscription.getPlanId(),
                subscription.getPlanName(),
                subscription.getStatus(),
                subscription.getStartDate(),
                subscription.getNextBillingDate()
        );
    }
}
