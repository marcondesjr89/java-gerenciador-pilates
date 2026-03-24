package br.com.gerenciadorpilates.scheduling.domain;

import br.com.gerenciadorpilates.identityaccess.domain.InstructorSpecialty;
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
@Table(name = "schedule_slot")
public class ScheduleSlot {

    @Id
    private UUID id;

    @Column(name = "instructor_user_id", nullable = false)
    private UUID instructorUserId;

    @Column(name = "instructor_name", nullable = false)
    private String instructorName;

    @Enumerated(EnumType.STRING)
    @Column(name = "required_specialty", nullable = false)
    private InstructorSpecialty requiredSpecialty;

    @Column(name = "start_time", nullable = false)
    private OffsetDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private OffsetDateTime endTime;

    @Column(nullable = false)
    private int capacity;

    @Column(name = "booked_count", nullable = false)
    private int bookedCount;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected ScheduleSlot() {
    }

    public ScheduleSlot(
            UUID id,
            UUID instructorUserId,
            String instructorName,
            InstructorSpecialty requiredSpecialty,
            OffsetDateTime startTime,
            OffsetDateTime endTime,
            int capacity
    ) {
        this.id = id;
        this.instructorUserId = instructorUserId;
        this.instructorName = instructorName;
        this.requiredSpecialty = requiredSpecialty;
        this.startTime = startTime;
        this.endTime = endTime;
        this.capacity = capacity;
        this.bookedCount = 0;
    }

    public void incrementBookedCount() {
        if (bookedCount >= capacity) {
            throw new IllegalStateException("A vaga informada nao possui mais capacidade.");
        }
        bookedCount++;
    }

    public void decrementBookedCount() {
        if (bookedCount > 0) {
            bookedCount--;
        }
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

    public InstructorSpecialty getRequiredSpecialty() {
        return requiredSpecialty;
    }

    public OffsetDateTime getStartTime() {
        return startTime;
    }

    public OffsetDateTime getEndTime() {
        return endTime;
    }

    public int getCapacity() {
        return capacity;
    }

    public int getBookedCount() {
        return bookedCount;
    }
}
