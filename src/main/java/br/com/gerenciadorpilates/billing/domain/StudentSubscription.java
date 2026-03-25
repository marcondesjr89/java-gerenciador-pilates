package br.com.gerenciadorpilates.billing.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "student_subscription")
public class StudentSubscription {

    @Id
    private UUID id;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(name = "plan_id", nullable = false)
    private UUID planId;

    @Column(name = "plan_name", nullable = false)
    private String planName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionStatus status;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "next_billing_date", nullable = false)
    private LocalDate nextBillingDate;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected StudentSubscription() {
    }

    public StudentSubscription(
            UUID id,
            UUID studentId,
            String studentName,
            UUID planId,
            String planName,
            LocalDate startDate,
            LocalDate nextBillingDate
    ) {
        this.id = id;
        this.studentId = studentId;
        this.studentName = studentName;
        this.planId = planId;
        this.planName = planName;
        this.status = SubscriptionStatus.ACTIVE;
        this.startDate = startDate;
        this.nextBillingDate = nextBillingDate;
    }

    public void advanceNextBillingDate(int months) {
        this.nextBillingDate = this.nextBillingDate.plusMonths(months);
    }

    @PrePersist
    void prePersist() {
        OffsetDateTime now = OffsetDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getStudentId() {
        return studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public UUID getPlanId() {
        return planId;
    }

    public String getPlanName() {
        return planName;
    }

    public SubscriptionStatus getStatus() {
        return status;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getNextBillingDate() {
        return nextBillingDate;
    }
}
