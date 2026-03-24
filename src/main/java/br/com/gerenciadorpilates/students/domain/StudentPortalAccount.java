package br.com.gerenciadorpilates.students.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "student_portal_account")
public class StudentPortalAccount {

    @Id
    private UUID id;

    @Column(name = "student_id", nullable = false, unique = true)
    private UUID studentId;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected StudentPortalAccount() {
    }

    public StudentPortalAccount(UUID id, UUID studentId, String email, String passwordHash, boolean active) {
        this.id = id;
        this.studentId = studentId;
        this.email = email;
        this.passwordHash = passwordHash;
        this.active = active;
    }

    public void activate(String passwordHash) {
        this.passwordHash = passwordHash;
        this.active = true;
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

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public boolean isActive() {
        return active;
    }
}
