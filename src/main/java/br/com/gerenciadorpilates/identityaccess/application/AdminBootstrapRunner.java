package br.com.gerenciadorpilates.identityaccess.application;

import br.com.gerenciadorpilates.identityaccess.domain.AppUser;
import br.com.gerenciadorpilates.identityaccess.domain.UserRole;
import br.com.gerenciadorpilates.identityaccess.infrastructure.AppUserRepository;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrapRunner implements CommandLineRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(AdminBootstrapRunner.class);

    private final AdminBootstrapProperties properties;
    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminBootstrapRunner(
            AdminBootstrapProperties properties,
            AppUserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.properties = properties;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!properties.enabled()) {
            return;
        }

        if (userRepository.count() > 0) {
            return;
        }

        if (isBlank(properties.email()) || isBlank(properties.password()) || isBlank(properties.fullName())) {
            LOGGER.warn("Bootstrap admin habilitado, mas faltam dados obrigatorios.");
            return;
        }

        AppUser admin = new AppUser(
                UUID.randomUUID(),
                properties.email().trim().toLowerCase(),
                properties.fullName().trim(),
                passwordEncoder.encode(properties.password()),
                UserRole.ADMIN,
                true
        );

        userRepository.save(admin);
        LOGGER.info("Usuario administrador inicial criado com o e-mail {}", admin.getEmail());
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
