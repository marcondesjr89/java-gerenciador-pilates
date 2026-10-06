package br.com.gerenciadorpilates.platform.config;

import br.com.gerenciadorpilates.platform.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder
    )
            throws Exception {
        DaoAuthenticationProvider authenticationProvider = authenticationProvider(userDetailsService, passwordEncoder);
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(
                                "/actuator/health",
                                "/api/v1/system/info",
                                "/api/v1/auth/login",
                                "/api/v1/student-portal/auth/login",
                                "/api/v1/public/legal-acceptances/*/verification"
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/instructors").hasAnyRole("ADMIN", "RECEPTION")
                        .requestMatchers("/api/v1/users/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/students/*/portal-account/**").hasAnyRole("ADMIN", "RECEPTION")
                        .requestMatchers("/api/v1/students/*/legal-acceptances/**").hasAnyRole("ADMIN", "RECEPTION", "INSTRUCTOR")
                        .requestMatchers("/api/v1/student-portal/me/**").hasRole("STUDENT")
                        .requestMatchers("/api/v1/schedule-slots/*/bookings/*/self-service-**").hasRole("STUDENT")
                        .requestMatchers(HttpMethod.GET, "/api/v1/schedule-slots/*/waitlist/**").hasAnyRole("ADMIN", "RECEPTION")
                        .requestMatchers(HttpMethod.POST, "/api/v1/schedule-slots/*/waitlist/**").hasAnyRole("ADMIN", "RECEPTION")
                        .requestMatchers("/api/v1/students/*/anamnesis/**").hasAnyRole("ADMIN", "INSTRUCTOR")
                        .requestMatchers("/api/v1/students/*/progress-entries/**").hasAnyRole("ADMIN", "INSTRUCTOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/schedule-blocks/**").hasAnyRole("ADMIN", "RECEPTION")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/schedule-blocks/**").hasAnyRole("ADMIN", "RECEPTION")
                        .requestMatchers(HttpMethod.POST, "/api/v1/schedule-blocks/**").hasAnyRole("ADMIN", "RECEPTION")
                        .requestMatchers(HttpMethod.GET, "/api/v1/schedule-blocks/**").hasAnyRole("ADMIN", "RECEPTION")
                        .requestMatchers(HttpMethod.GET, "/api/v1/schedule-slots/**").hasAnyRole("ADMIN", "RECEPTION", "INSTRUCTOR")
                        .requestMatchers(HttpMethod.POST, "/api/v1/schedule-slots/**").hasAnyRole("ADMIN", "RECEPTION")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/schedule-slots/**").hasAnyRole("ADMIN", "RECEPTION")
                        .requestMatchers("/api/v1/billing/**").hasAnyRole("ADMIN", "RECEPTION")
                        .requestMatchers("/api/v1/financial/**").hasAnyRole("ADMIN", "RECEPTION")
                        .requestMatchers("/api/v1/notifications/**").hasAnyRole("ADMIN", "RECEPTION")
                        .requestMatchers("/api/v1/dashboard/**").hasAnyRole("ADMIN", "RECEPTION")
                        .requestMatchers(HttpMethod.POST, "/api/v1/students/*/anonymize").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/students/**").hasAnyRole("ADMIN", "RECEPTION", "INSTRUCTOR")
                        .requestMatchers("/api/v1/students/**").hasAnyRole("ADMIN", "RECEPTION")
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationManager authenticationManager(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        return new ProviderManager(authenticationProvider(userDetailsService, passwordEncoder));
    }

    private DaoAuthenticationProvider authenticationProvider(
            UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder
    ) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }
}
