package com.jobconnect.feed.config;

/**
 * BUGFIX: this class used to declare a fully commented-out CORS @Configuration/@Bean pair --
 * dead code, harmless only because every real browser call goes through api-gateway's own
 * CORS config instead.
 *
 * This was initially re-enabled (see git history) on the theory that feed-service should be
 * independently browser-reachable, but that surfaced a concrete bug during manual end-to-end
 * testing: api-gateway proxies feed-service's response as-is (including feed-service's own
 * Access-Control-Allow-Origin / Access-Control-Allow-Credentials headers), and then
 * api-gateway's own SecurityConfig CORS bean adds its own copies of the same headers on top --
 * so every gateway-routed feed-service response ended up with *duplicated*
 * Access-Control-Allow-Origin headers, which browsers reject outright (observed live as
 * "Failed to fetch feed" / net::ERR_FAILED in the real frontend, even though the same request
 * worked fine via curl, which doesn't enforce CORS).
 *
 * The other three backend services (auth/profile/job) have no CORS config of their own and
 * rely entirely on api-gateway being the single CORS authority -- which is also this
 * project's stated architecture (see PROJECT_DOCUMENTATION.md's interview Q&A #3: "Without
 * [the gateway]: profile-service and job-service have zero CORS config of their own and would
 * reject direct browser calls outright"). Kept consistent with that: this class stays present
 * but inert (no @Configuration, no @Bean) rather than re-enabled, so feed-service's behavior
 * matches the other three services and the gateway remains the one place CORS is decided.
 */
public class WebConfig {
}
