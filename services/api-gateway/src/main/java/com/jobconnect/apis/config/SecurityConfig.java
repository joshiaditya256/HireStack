package com.jobconnect.apis.config;

import com.jobconnect.apis.filter.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authorization.HttpStatusServerAccessDeniedHandler;
import org.springframework.http.HttpStatus;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import reactor.core.publisher.Mono;

import java.util.List;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final SecurityProperties securityProperties;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, SecurityProperties securityProperties) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.securityProperties = securityProperties;
    }

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable) // Disable basic auth to prevent browser popup
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                .exceptionHandling(exceptionHandling -> exceptionHandling
                        .authenticationEntryPoint((exchange, e) -> Mono.fromRunnable(() -> {
                            exchange.getResponse().setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
                        }))
                        .accessDeniedHandler(new HttpStatusServerAccessDeniedHandler(HttpStatus.FORBIDDEN)))
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeExchange(exchanges -> exchanges
                        .pathMatchers(securityProperties.getPublicPaths().toArray(new String[0])).permitAll()
                        // Role-based authorization, enforced here (in addition to each downstream
                        // service's own checks) so a wrong-role request never even reaches job-service --
                        // pure defense in depth, since JwtAuthenticationFilter has already put a
                        // ROLE_<...> authority (derived from the validated JWT, not client input) into the
                        // reactive SecurityContext by the time these rules run.
                        .pathMatchers(HttpMethod.POST, "/api/jobs").hasAnyAuthority("ROLE_RECRUITER", "ROLE_ADMIN")
                        .pathMatchers(HttpMethod.PUT, "/api/jobs/**").hasAnyAuthority("ROLE_RECRUITER", "ROLE_ADMIN")
                        .pathMatchers(HttpMethod.DELETE, "/api/jobs/**").hasAnyAuthority("ROLE_RECRUITER", "ROLE_ADMIN")
                        .pathMatchers(HttpMethod.PATCH, "/api/jobs/*/close").hasAnyAuthority("ROLE_RECRUITER", "ROLE_ADMIN")
                        .pathMatchers(HttpMethod.GET, "/api/jobs/*/applications").hasAnyAuthority("ROLE_RECRUITER", "ROLE_ADMIN")
                        .pathMatchers(HttpMethod.POST, "/api/companies/**").hasAnyAuthority("ROLE_RECRUITER", "ROLE_ADMIN")
                        .pathMatchers(HttpMethod.PUT, "/api/companies/**").hasAnyAuthority("ROLE_RECRUITER", "ROLE_ADMIN")
                        .pathMatchers(HttpMethod.DELETE, "/api/companies/**").hasAnyAuthority("ROLE_RECRUITER", "ROLE_ADMIN")
                        .pathMatchers(HttpMethod.POST, "/api/applications").hasAuthority("ROLE_CANDIDATE")
                        .pathMatchers(HttpMethod.GET, "/api/applications/job/**").hasAnyAuthority("ROLE_RECRUITER", "ROLE_ADMIN")
                        .anyExchange().authenticated())
                .addFilterAt(jwtAuthenticationFilter, SecurityWebFiltersOrder.AUTHENTICATION)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173")); // ✅ prefer List.of() over Arrays.asList()
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}