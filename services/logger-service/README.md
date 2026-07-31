# logger-service (.NET) — centralized activity logging

## Why this exists

The HireStack resume bullet claims: *"a .NET logger service for centralized activity
logging across services."* Before this folder was added, that service did not exist
anywhere in the repository — the only related artifact was an unused `logs` table
declared in `infra/docker/mysql/init.sql` that no application code ever read or wrote.

This is a from-scratch ASP.NET Core (.NET 8) minimal API that makes that resume line
true: it gives the existing `logs` table its first real writer and reader, and
`services/api-gateway`'s new `ActivityLoggingFilter` now calls it after every request the
gateway routes.

## What it does

- `POST /api/logs` — insert one activity record (`userId`, `service`, `endpoint`,
  `method`, `statusCode`, `durationMs`). Called by the gateway's `ActivityLoggingFilter`
  in fire-and-forget fashion (a logging failure or outage never affects a real request).
- `GET /api/logs?service=&page=&size=` — paginated read of recent activity, optionally
  filtered by service name (`auth-service`, `profile-service`, `job-service`,
  `feed-service`, `api-gateway`).
- `GET /api/logs/stats/by-service` — request-count aggregate per service, the one bit
  of genuinely "centralized" reporting this service offers beyond raw rows.
- `GET /health` — trivial liveness check.

## How it fits into the platform

```
client (React) → api-gateway (Spring Cloud Gateway, :8080)
                     │  validates JWT, routes to the 4 Spring Boot services
                     └─ ActivityLoggingFilter ──(fire-and-forget POST)──▶ logger-service (.NET, :5090)
                                                                              │
                                                                              ▼
                                                                    MySQL "logs" table
```

Only the gateway calls it today (that is the one place that already sees every request
to every downstream service). Any of the 4 Java services could POST to it the same way if
you wanted per-service internal logging too — the endpoint doesn't care who calls it, it
just needs `service`/`endpoint`/`method`/`statusCode`/`durationMs`.

## Running it locally

Requires the .NET 8 SDK.

```bash
cd services/logger-service
dotnet restore
dotnet run
```

It listens on `http://localhost:5090` (see `appsettings.json` → `Urls`) and expects the
same MySQL instance the other 4 services use (`infra/docker/mysql/docker-compose.yml`,
database `jobConnect`, port `3308`). The connection string in `appsettings.json` reuses
the same dev credentials already committed in every other service's
`application-secret.properties`/`.yml` (see the main deep-dive doc's "Known Issues"
section for why plaintext committed secrets are flagged as a real problem, not something
to imitate in a production setting — the intent here is "runs out of the box for a
CDAC demo," not "production-hardened secrets management").

To point the gateway at a different logger-service host/port, override
`logger.service.url` in `services/api-gateway/src/main/resources/application.yml`
(or via the `LOGGER_SERVICE_URL` environment variable / Spring's standard
relaxed-binding env override `LOGGER_SERVICE_URL` → `logger.service.url`).
Set `logger.service.enabled: false` there to turn activity logging off entirely
without touching code.

## Design choices worth being able to explain in an interview

- **Plain ADO.NET (`MySqlConnector`) instead of EF Core.** This is a single-table,
  write-heavy/read-light service. An ORM would add mapping/migration overhead for no
  real benefit here; a few parameterized SQL statements are simpler to reason about and
  faster to execute.
- **Fire-and-forget from the gateway, not a blocking call.** The gateway's
  `ActivityLoggingFilter` subscribes to the logging POST independently of the actual
  response and swallows any error — so if logger-service is down, slow, or returns an
  error, real user-facing requests through the gateway are completely unaffected. The
  tradeoff is that this is *at-most-once*, best-effort logging: if the gateway crashes
  between finishing a response and the fire-and-forget POST landing, that one activity
  row is simply lost. That's an acceptable tradeoff for activity/observability logging
  (unlike, say, payment records), and is the same tradeoff most real logging/metrics
  pipelines (e.g. StatsD, most APM agents) make.
- **Minimal API, not full MVC controllers.** For 4 small endpoints with no shared
  cross-cutting concerns beyond CORS, a minimal API keeps the whole service in one
  readable `Program.cs` instead of spreading it across controller/service/DI boilerplate
  that would add no real value at this size.
