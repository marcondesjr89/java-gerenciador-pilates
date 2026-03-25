package br.com.gerenciadorpilates.reporting.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "instructor_commission_profile")
public class InstructorCommissionProfile {

    @Id
    private UUID id;

    @Column(name = "instructor_user_id", nullable = false, unique = true)
    private UUID instructorUserId;

    @Column(name = "instructor_name", nullable = false)
    private String instructorName;

    @Enumerated(EnumType.STRING)
    @Column(name = "commission_model", nullable = false)
    private CommissionModel commissionModel;

    @Column(name = "unit_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitAmount;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected InstructorCommissionProfile() {
    }

    public InstructorCommissionProfile(
            UUID id,
            UUID instructorUserId,
            String instructorName,
            CommissionModel commissionModel,
            BigDecimal unitAmount,
            boolean active
    ) {
        this.id = id;
        this.instructorUserId = instructorUserId;
        this.instructorName = instructorName;
        this.commissionModel = commissionModel;
        this.unitAmount = unitAmount;
        this.active = active;
    }

    public void update(CommissionModel commissionModel, BigDecimal unitAmount, boolean active) {
        this.commissionModel = commissionModel;
        this.unitAmount = unitAmount;
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

    public UUID getInstructorUserId() {
        return instructorUserId;
    }

    public String getInstructorName() {
        return instructorName;
    }

    public CommissionModel getCommissionModel() {
        return commissionModel;
    }

    public BigDecimal getUnitAmount() {
        return unitAmount;
    }

    public boolean isActive() {
        return active;
    }
}
