package br.com.gerenciadorpilates.platform.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final JwtProperties properties;
    private final SecretKey signingKey;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        this.signingKey = Keys.hmacShaKeyFor(properties.secret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String subject, String role) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(properties.expirationSeconds());

        return Jwts.builder()
                .subject(subject)
                .claims(Map.of("role", role))
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(signingKey)
                .compact();
    }

    public String extractSubject(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, String expectedSubject) {
        Claims claims = parseClaims(token);
        return expectedSubject.equalsIgnoreCase(claims.getSubject()) && claims.getExpiration().after(new Date());
    }

    public long getExpirationInSeconds() {
        return properties.expirationSeconds();
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
