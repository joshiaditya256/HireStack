package com.hirestack.auth.security;

import io.jsonwebtoken.Claims;
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
 * this same jwt.secret value. No "role" claim is issued, matching original behavior.
 */
@Component
public class JwtUtil {

    private static final long AUTH_TOKEN_VALIDITY_MS = 2_592_000_000L; // 30 days
    private static final long RESET_TOKEN_VALIDITY_MS = 15 * 60 * 1000L; // 15 minutes

    @Value("${jwt.secret}")
    private String jwtSecret;

    public String generateAuthToken(String email, Long userId) {
        return buildToken(email, userId, AUTH_TOKEN_VALIDITY_MS);
    }

    public String generatePasswordResetToken(String email, Long userId) {
        return buildToken(email, userId, RESET_TOKEN_VALIDITY_MS);
    }

    private String buildToken(String email, Long userId, long validityMs) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + validityMs);
        return Jwts.builder()
                .claim("email", email)
                .claim("userId", userId)
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
