package com.hirestack.auth.security;

import com.hirestack.auth.entity.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Issues and parses the same HS256 JWT shape the original Node auth-service produced
 * (jwt.sign({ email, userId }, JWT_SECRET, { expiresIn })), since api-gateway's
 * JwtAuthenticationFilter reads the "email" claim and validates the signature with
 * this same jwt.secret value.
 *
 * BUGFIX: this used to never issue a "role" claim, so api-gateway's JwtAuthenticationFilter
 * (which already had code to read claims.get("role")) always fell back to a hardcoded
 * "ROLE_USER" for every principal -- meaning ADMIN/RECRUITER/CANDIDATE were indistinguishable
 * once logged in. generateAuthToken now embeds "ROLE_<Role name>" so the gateway's existing
 * role-reading logic actually has something real to read.
 */
@Component
public class JwtUtil { 

    private static final long AUTH_TOKEN_VALIDITY_MS = 2_592_000_000L; // 30 days
    private static final long RESET_TOKEN_VALIDITY_MS = 15 * 60 * 1000L; // 15 minutes

    @Value("${jwt.secret}")
    private String jwtSecret;

    public String generateAuthToken(String email, Long userId, Role role) {
        return buildToken(email, userId, AUTH_TOKEN_VALIDITY_MS, role);
    }

    public String generatePasswordResetToken(String email, Long userId) {
        // Intentionally no role claim: a reset token is only ever consumed by
        // resetPassword(), which never checks authorization -- only identity.
        return buildToken(email, userId, RESET_TOKEN_VALIDITY_MS, null);
    }

    private String buildToken(String email, Long userId, long validityMs, Role role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + validityMs);
        JwtBuilder builder = Jwts.builder()
                .claim("email", email)
                .claim("userId", userId);
        if (role != null) {
            builder.claim("role", "ROLE_" + role.name());
        }
        return builder
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(signingKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public Long extractUserId(Claims claims) {
        Object raw = claims.get("userId");
        if (raw instanceof Number number) {
            return number.longValue();
        }
        return Long.parseLong(String.valueOf(raw));
    }

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }
}
