package br.com.gerenciadorpilates.students.domain;

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
@Table(name = "student")
public class Student {

    @Id
    private UUID id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true, length = 11)
    private String cpf;

    @Column(nullable = false)
    private String email;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StudentStatus status;

    @Column(nullable = false)
    private boolean lgpdConsent;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "anonymized_at")
    private OffsetDateTime anonymizedAt;

    @Column(name = "anonymized_reason", length = 500)
    private String anonymizedReason;

    protected Student() {
    }

    public Student(
            UUID id,
            String fullName,
            String cpf,
            String email,
            String phoneNumber,
            LocalDate birthDate,
            StudentStatus status,
            boolean lgpdConsent
    ) {
        this.id = id;
        this.fullName = fullName;
        this.cpf = cpf;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.birthDate = birthDate;
        this.status = status;
        this.lgpdConsent = lgpdConsent;
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

    public String getFullName() {
        return fullName;
    }

    public String getCpf() {
        return cpf;
    }

    public String getEmail() {
        return email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public StudentStatus getStatus() {
        return status;
    }

    public boolean isLgpdConsent() {
        return lgpdConsent;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public OffsetDateTime getAnonymizedAt() {
        return anonymizedAt;
    }

    public String getAnonymizedReason() {
        return anonymizedReason;
    }

    public void updateLgpdConsent(boolean lgpdConsent) {
        this.lgpdConsent = lgpdConsent;
    }

    public void updatePersonalData(
            String fullName,
            String email,
            String phoneNumber,
            LocalDate birthDate
    ) {
        if (this.status == StudentStatus.ANONYMIZED) {
            throw new IllegalStateException("Nao e permitido alterar dados de um aluno anonimizado.");
        }
        this.fullName = fullName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.birthDate = birthDate;
    }

    public void updateStatus(StudentStatus newStatus) {
        if (this.status == StudentStatus.ANONYMIZED) {
            throw new IllegalStateException("Nao e permitido alterar o status de um aluno anonimizado.");
        }
        if (newStatus == StudentStatus.ANONYMIZED) {
            throw new IllegalArgumentException("Para anonimizar o aluno, utilize a operacao de anonimizacao com justificativa.");
        }
        this.status = newStatus;
    }

    public void anonymize(String reason) {
        if (this.status == StudentStatus.ANONYMIZED) {
            throw new IllegalStateException("Aluno ja se encontra anonimizado.");
        }
        String identifier = id.toString().replace("-", "").toUpperCase(java.util.Locale.ROOT);
        this.fullName = "Aluno Anonimizado " + identifier.substring(0, 8);
        this.cpf = "ANON" + identifier.substring(0, 7);
        this.email = "anonimizado-" + identifier.substring(0, 8).toLowerCase(java.util.Locale.ROOT) + "@gerenciadorpilates.local";
        this.phoneNumber = "00000000000";
        this.birthDate = null;
        this.status = StudentStatus.ANONYMIZED;
        this.lgpdConsent = false;
        this.anonymizedAt = OffsetDateTime.now();
        this.anonymizedReason = reason == null || reason.isBlank()
                ? "Solicitacao de anonimizacao e exclusao cadastral nos termos da LGPD (Art. 18)."
                : reason.trim();
    }
}
