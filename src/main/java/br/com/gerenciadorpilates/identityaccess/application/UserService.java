package br.com.gerenciadorpilates.identityaccess.application;

import br.com.gerenciadorpilates.identityaccess.api.CreateUserRequest;
import br.com.gerenciadorpilates.identityaccess.api.InstructorSummaryResponse;
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
}
