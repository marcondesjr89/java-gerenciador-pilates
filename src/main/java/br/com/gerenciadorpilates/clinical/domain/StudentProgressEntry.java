package br.com.gerenciadorpilates.clinical.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "student_progress_entry")
public class StudentProgressEntry {

    @Id
    private UUID id;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "created_by_user_id", nullable = false)
    private UUID createdByUserId;

    @Column(name = "created_by_user_name", nullable = false)
    private String createdByUserName;

    @Column(name = "recorded_at", nullable = false)
    private OffsetDateTime recordedAt;

    @Column(name = "instructor_notes", nullable = false, length = 2000)
    private String instructorNotes;

    @Column(name = "flexibility_score")
    private Integer flexibilityScore;

    @Column(name = "strength_score")
    private Integer strengthScore;

    @Column(name = "pain_level")
    private Integer painLevel;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected StudentProgressEntry() {
    }

    public StudentProgressEntry(
            UUID id,
            UUID studentId,
            UUID createdByUserId,
            String createdByUserName,
            OffsetDateTime recordedAt,
            String instructorNotes,
            Integer flexibilityScore,
            Integer strengthScore,
            Integer painLevel
    ) {
        this.id = id;
        this.studentId = studentId;
        this.createdByUserId = createdByUserId;
        this.createdByUserName = createdByUserName;
        this.recordedAt = recordedAt;
        this.instructorNotes = instructorNotes;
        this.flexibilityScore = flexibilityScore;
        this.strengthScore = strengthScore;
        this.painLevel = painLevel;
    }

    @PrePersist
    void prePersist() {
        createdAt = OffsetDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getStudentId() {
        return studentId;
    }

    public UUID getCreatedByUserId() {
        return createdByUserId;
    }

    public String getCreatedByUserName() {
        return createdByUserName;
    }

    public OffsetDateTime getRecordedAt() {
        return recordedAt;
    }

    public String getInstructorNotes() {
        return instructorNotes;
    }

    public Integer getFlexibilityScore() {
        return flexibilityScore;
    }

    public Integer getStrengthScore() {
        return strengthScore;
    }

    public Integer getPainLevel() {
        return painLevel;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
