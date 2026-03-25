package br.com.gerenciadorpilates.billing.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "billing_invoice")
public class BillingInvoice {

    @Id
    private UUID id;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(name = "subscription_id", nullable = false)
    private UUID subscriptionId;

    @Column(name = "reference_month", nullable = false)
    private LocalDate referenceMonth;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "amount_due", nullable = false, precision = 12, scale = 2)
    private BigDecimal amountDue;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvoiceStatus status;

    @Column(name = "paid_at")
    private OffsetDateTime paidAt;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected BillingInvoice() {
    }

    public BillingInvoice(
            UUID id,
            UUID studentId,
            String studentName,
            UUID subscriptionId,
            LocalDate referenceMonth,
            LocalDate dueDate,
            BigDecimal amountDue
    ) {
        this.id = id;
        this.studentId = studentId;
        this.studentName = studentName;
        this.subscriptionId = subscriptionId;
        this.referenceMonth = referenceMonth.withDayOfMonth(1);
        this.dueDate = dueDate;
        this.amountDue = amountDue;
        this.status = InvoiceStatus.OPEN;
    }

    public void markAsPaid(OffsetDateTime paidAt) {
        this.status = InvoiceStatus.PAID;
        this.paidAt = paidAt;
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

    public UUID getSubscriptionId() {
        return subscriptionId;
    }

    public LocalDate getReferenceMonth() {
        return referenceMonth;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public BigDecimal getAmountDue() {
        return amountDue;
    }

    public InvoiceStatus getStatus() {
        return status;
    }

    public OffsetDateTime getPaidAt() {
        return paidAt;
    }
}
