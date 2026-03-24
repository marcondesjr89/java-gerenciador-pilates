package br.com.gerenciadorpilates.identityaccess.api;

import br.com.gerenciadorpilates.identityaccess.application.UserService;
import br.com.gerenciadorpilates.platform.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;

    public AuthController(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserService userService
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userService = userService;
    }

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password())
        );

        User principal = (User) authentication.getPrincipal();
        UserResponse user = userService.getByEmail(principal.getUsername());
        String token = jwtService.generateToken(
                user.email(),
                user.role().name(),
                java.util.Map.of(
                        "principalType", "USER",
                        "principalId", user.id().toString(),
                        "fullName", user.fullName()
                )
        );

        return new LoginResponse(
                token,
                "Bearer",
                jwtService.getExpirationInSeconds(),
                user.email(),
                user.role()
        );
    }
}
