package br.com.gerenciadorpilates.billing.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "billing_payment")
public class BillingPayment {

    @Id
    private UUID id;

    @Column(name = "invoice_id", nullable = false)
    private UUID invoiceId;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "amount_paid", nullable = false, precision = 12, scale = 2)
    private BigDecimal amountPaid;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    @Column(name = "paid_at", nullable = false)
    private OffsetDateTime paidAt;

    @Column(name = "external_reference")
    private String externalReference;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected BillingPayment() {
    }

    public BillingPayment(
            UUID id,
            UUID invoiceId,
            UUID studentId,
            BigDecimal amountPaid,
            PaymentMethod paymentMethod,
            OffsetDateTime paidAt,
            String externalReference
    ) {
        this.id = id;
        this.invoiceId = invoiceId;
        this.studentId = studentId;
        this.amountPaid = amountPaid;
        this.paymentMethod = paymentMethod;
        this.paidAt = paidAt;
        this.externalReference = externalReference;
    }

    @PrePersist
    void prePersist() {
        createdAt = OffsetDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getInvoiceId() {
        return invoiceId;
    }

    public UUID getStudentId() {
        return studentId;
    }

    public BigDecimal getAmountPaid() {
        return amountPaid;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public OffsetDateTime getPaidAt() {
        return paidAt;
    }

    public String getExternalReference() {
        return externalReference;
    }
}
