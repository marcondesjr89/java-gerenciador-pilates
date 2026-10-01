package br.com.gerenciadorpilates.identityaccess.domain;

import jakarta.persistence.Column;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Entity;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "app_user")
public class AppUser {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(nullable = false)
    private boolean active;

    @ElementCollection(targetClass = InstructorSpecialty.class)
    @CollectionTable(name = "user_specialty", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "specialty", nullable = false)
    private Set<InstructorSpecialty> specialties = new HashSet<>();

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected AppUser() {
    }

    public AppUser(UUID id, String email, String fullName, String passwordHash, UserRole role, boolean active) {
        this(id, email, fullName, passwordHash, role, active, Set.of());
    }

    public AppUser(
            UUID id,
            String email,
            String fullName,
            String passwordHash,
            UserRole role,
            boolean active,
            Set<InstructorSpecialty> specialties
    ) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.passwordHash = passwordHash;
        this.role = role;
        this.active = active;
        this.specialties = new HashSet<>(specialties);
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

    public String getEmail() {
        return email;
    }

    public String getFullName() {
        return fullName;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public UserRole getRole() {
        return role;
    }

    public boolean isActive() {
        return active;
    }

    public Set<InstructorSpecialty> getSpecialties() {
        return Set.copyOf(specialties);
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void activate() {
        this.active = true;
    }

    public void deactivate() {
        this.active = false;
    }

    public void updateProfile(String fullName, UserRole role, Set<InstructorSpecialty> specialties) {
        if (fullName == null || fullName.trim().isEmpty()) {
            throw new IllegalArgumentException("O nome completo e obrigatorio.");
        }
        if (role == null) {
            throw new IllegalArgumentException("O perfil e obrigatorio.");
        }
        this.fullName = fullName.trim();
        this.role = role;
        this.specialties.clear();
        if (specialties != null) {
            this.specialties.addAll(specialties);
        }
    }

    public void changePassword(String newPasswordHash) {
        if (newPasswordHash == null || newPasswordHash.trim().isEmpty()) {
            throw new IllegalArgumentException("O hash da senha e obrigatorio.");
        }
        this.passwordHash = newPasswordHash;
    }
}
