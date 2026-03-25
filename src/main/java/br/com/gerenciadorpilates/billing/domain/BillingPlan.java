package br.com.gerenciadorpilates.billing.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "billing_plan")
public class BillingPlan {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "price_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal priceAmount;

    @Column(name = "billing_cycle_months", nullable = false)
    private int billingCycleMonths;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected BillingPlan() {
    }

    public BillingPlan(UUID id, String name, BigDecimal priceAmount, int billingCycleMonths, boolean active) {
        this.id = id;
        this.name = name;
        this.priceAmount = priceAmount;
        this.billingCycleMonths = billingCycleMonths;
        this.active = active;
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

    public String getName() {
        return name;
    }

    public BigDecimal getPriceAmount() {
        return priceAmount;
    }

    public int getBillingCycleMonths() {
        return billingCycleMonths;
    }

    public boolean isActive() {
        return active;
    }
}
