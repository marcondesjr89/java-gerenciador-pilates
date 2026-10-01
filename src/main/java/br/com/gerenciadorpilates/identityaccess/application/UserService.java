package br.com.gerenciadorpilates.identityaccess.application;

import br.com.gerenciadorpilates.identityaccess.api.CreateUserRequest;
import br.com.gerenciadorpilates.identityaccess.api.InstructorSummaryResponse;
import br.com.gerenciadorpilates.identityaccess.api.UpdateUserRequest;
import br.com.gerenciadorpilates.identityaccess.api.UserResponse;
import br.com.gerenciadorpilates.identityaccess.domain.AppUser;
import br.com.gerenciadorpilates.identityaccess.domain.UserRole;
import br.com.gerenciadorpilates.identityaccess.infrastructure.AppUserRepository;
import br.com.gerenciadorpilates.platform.domain.ResourceNotFoundException;
import java.util.List;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(AppUserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse create(CreateUserRequest request) {
        userRepository.findByEmailIgnoreCase(request.email())
                .ifPresent(user -> {
                    throw new IllegalArgumentException("Ja existe um usuario com este e-mail.");
                });

        AppUser user = new AppUser(
                UUID.randomUUID(),
                request.email().trim().toLowerCase(),
                request.fullName().trim(),
                passwordEncoder.encode(request.password()),
                request.role(),
                true,
                request.specialties() == null ? java.util.Set.of() : request.specialties()
        );

        AppUser savedUser = userRepository.save(user);
        return UserResponse.from(savedUser);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> list() {
        return userRepository.findAll()
                .stream()
                .map(UserResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InstructorSummaryResponse> listActiveInstructors() {
        return userRepository.findAllByRoleAndActiveTrueOrderByFullNameAsc(UserRole.INSTRUCTOR)
                .stream()
                .map(InstructorSummaryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse getByEmail(String email) {
        AppUser user = userRepository.findByEmailIgnoreCaseAndActiveTrue(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado."));
        return UserResponse.from(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getById(UUID id) {
        AppUser user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado."));
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse update(UUID id, UpdateUserRequest request, String currentUsername) {
        AppUser user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado."));

        if (user.getRole() == UserRole.ADMIN && request.role() != UserRole.ADMIN && user.isActive()) {
            long activeAdmins = userRepository.countByRoleAndActiveTrue(UserRole.ADMIN);
            if (activeAdmins <= 1) {
                throw new IllegalArgumentException("Nao e possivel alterar o perfil do unico administrador ativo.");
            }
        }

        user.updateProfile(request.fullName(), request.role(), request.specialties());
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse updateStatus(UUID id, boolean active, String currentUsername) {
        AppUser user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado."));

        if (!active) {
            if (currentUsername != null && user.getEmail().equalsIgnoreCase(currentUsername.trim())) {
                throw new IllegalArgumentException("Voce nao pode inativar seu proprio usuario.");
            }
            if (user.getRole() == UserRole.ADMIN) {
                long activeAdmins = userRepository.countByRoleAndActiveTrue(UserRole.ADMIN);
                if (activeAdmins <= 1) {
                    throw new IllegalArgumentException("Nao e possivel inativar o unico administrador ativo.");
                }
            }
            user.deactivate();
        } else {
            user.activate();
        }

        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse changePassword(UUID id, String newPassword) {
        AppUser user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado."));

        if (newPassword == null || newPassword.trim().length() < 8) {
            throw new IllegalArgumentException("A nova senha deve possuir pelo menos 8 caracteres.");
        }

        user.changePassword(passwordEncoder.encode(newPassword.trim()));
        return UserResponse.from(user);
    }
}
