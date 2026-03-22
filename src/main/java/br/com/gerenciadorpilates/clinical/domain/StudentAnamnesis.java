package br.com.gerenciadorpilates.clinical.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "student_anamnesis")
public class StudentAnamnesis {

    @Id
    private UUID id;

    @Column(name = "student_id", nullable = false, unique = true)
    private UUID studentId;

    @Column(nullable = false)
    private boolean hasPathologies;

    @Column(name = "pathology_details", length = 1000)
    private String pathologyDetails;

    @Column(nullable = false)
    private boolean hasSurgeries;

    @Column(name = "surgery_details", length = 1000)
    private String surgeryDetails;

    @Column(nullable = false)
    private boolean hasPain;

    @Column(name = "pain_details", length = 1000)
    private String painDetails;

    @Column(nullable = false)
    private boolean hasHypertension;

    @Column(nullable = false)
    private boolean hasOsteoporosis;

    @Column(nullable = false)
    private boolean isPregnant;

    @Column(nullable = false)
    private boolean medicalClearanceRequired;

    @Column(name = "general_observations", length = 1500)
    private String generalObservations;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected StudentAnamnesis() {
    }

    public StudentAnamnesis(
            UUID id,
            UUID studentId,
            boolean hasPathologies,
            String pathologyDetails,
            boolean hasSurgeries,
            String surgeryDetails,
            boolean hasPain,
            String painDetails,
            boolean hasHypertension,
            boolean hasOsteoporosis,
            boolean isPregnant,
            boolean medicalClearanceRequired,
            String generalObservations
    ) {
        this.id = id;
        this.studentId = studentId;
        this.hasPathologies = hasPathologies;
        this.pathologyDetails = pathologyDetails;
        this.hasSurgeries = hasSurgeries;
        this.surgeryDetails = surgeryDetails;
        this.hasPain = hasPain;
        this.painDetails = painDetails;
        this.hasHypertension = hasHypertension;
        this.hasOsteoporosis = hasOsteoporosis;
        this.isPregnant = isPregnant;
        this.medicalClearanceRequired = medicalClearanceRequired;
        this.generalObservations = generalObservations;
    }

    public void update(
            boolean hasPathologies,
            String pathologyDetails,
            boolean hasSurgeries,
            String surgeryDetails,
            boolean hasPain,
            String painDetails,
            boolean hasHypertension,
            boolean hasOsteoporosis,
            boolean isPregnant,
            boolean medicalClearanceRequired,
            String generalObservations
    ) {
        this.hasPathologies = hasPathologies;
        this.pathologyDetails = pathologyDetails;
        this.hasSurgeries = hasSurgeries;
        this.surgeryDetails = surgeryDetails;
        this.hasPain = hasPain;
        this.painDetails = painDetails;
        this.hasHypertension = hasHypertension;
        this.hasOsteoporosis = hasOsteoporosis;
        this.isPregnant = isPregnant;
        this.medicalClearanceRequired = medicalClearanceRequired;
        this.generalObservations = generalObservations;
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

    public boolean isHasPathologies() {
        return hasPathologies;
    }

    public String getPathologyDetails() {
        return pathologyDetails;
    }

    public boolean isHasSurgeries() {
        return hasSurgeries;
    }

    public String getSurgeryDetails() {
        return surgeryDetails;
    }

    public boolean isHasPain() {
        return hasPain;
    }

    public String getPainDetails() {
        return painDetails;
    }

    public boolean isHasHypertension() {
        return hasHypertension;
    }

    public boolean isHasOsteoporosis() {
        return hasOsteoporosis;
    }

    public boolean isPregnant() {
        return isPregnant;
    }

    public boolean isMedicalClearanceRequired() {
        return medicalClearanceRequired;
    }

    public String getGeneralObservations() {
        return generalObservations;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}
