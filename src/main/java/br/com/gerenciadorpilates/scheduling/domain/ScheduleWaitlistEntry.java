package br.com.gerenciadorpilates.scheduling.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "schedule_waitlist_entry")
public class ScheduleWaitlistEntry {

    @Id
    private UUID id;

    @Column(name = "slot_id", nullable = false)
    private UUID slotId;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WaitlistStatus status;

    @Column(name = "promoted_at")
    private OffsetDateTime promotedAt;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected ScheduleWaitlistEntry() {
    }

    public ScheduleWaitlistEntry(UUID id, UUID slotId, UUID studentId, String studentName) {
        this.id = id;
        this.slotId = slotId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.status = WaitlistStatus.WAITING;
    }

    public void promote() {
        this.status = WaitlistStatus.PROMOTED;
        this.promotedAt = OffsetDateTime.now();
    }

    public void cancel() {
        this.status = WaitlistStatus.CANCELED;
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

    public UUID getSlotId() {
        return slotId;
    }

    public UUID getStudentId() {
        return studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public WaitlistStatus getStatus() {
        return status;
    }

    public OffsetDateTime getPromotedAt() {
        return promotedAt;
    }
}
