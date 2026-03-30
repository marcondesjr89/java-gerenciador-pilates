package br.com.gerenciadorpilates.scheduling.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "schedule_block")
public class ScheduleBlock {

    @Id
    private UUID id;

    @Column(name = "instructor_user_id", nullable = false)
    private UUID instructorUserId;

    @Column(name = "instructor_name", nullable = false)
    private String instructorName;

    @Column(name = "start_time", nullable = false)
    private OffsetDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private OffsetDateTime endTime;

    @Column(nullable = false)
    private String reason;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected ScheduleBlock() {
    }

    public ScheduleBlock(
            UUID id,
            UUID instructorUserId,
            String instructorName,
            OffsetDateTime startTime,
            OffsetDateTime endTime,
            String reason
    ) {
        this.id = id;
        this.instructorUserId = instructorUserId;
        this.instructorName = instructorName;
        this.startTime = startTime;
        this.endTime = endTime;
        this.reason = reason;
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

    public OffsetDateTime getStartTime() {
        return startTime;
    }

    public OffsetDateTime getEndTime() {
        return endTime;
    }

    public String getReason() {
        return reason;
    }

    public void update(
            UUID instructorUserId,
            String instructorName,
            OffsetDateTime startTime,
            OffsetDateTime endTime,
            String reason
    ) {
        this.instructorUserId = instructorUserId;
        this.instructorName = instructorName;
        this.startTime = startTime;
        this.endTime = endTime;
        this.reason = reason;
    }
}
