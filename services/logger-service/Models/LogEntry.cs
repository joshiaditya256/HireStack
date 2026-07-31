namespace HireStack.LoggerService.Models;

/// <summary>
/// Mirrors the "logs" table exactly as declared in
/// infra/docker/mysql/init.sql (log_id, user_id, service, endpoint, method,
/// status_code, duration_ms, timestamp) -- that table existed from day one but had
/// no application code reading or writing it until this service was added.
/// </summary>
public class LogEntry
{
    public long LogId { get; set; }
    public long? UserId { get; set; }
    public string Service { get; set; } = string.Empty;
    public string Endpoint { get; set; } = string.Empty;
    public string Method { get; set; } = string.Empty;
    public int StatusCode { get; set; }
    public int DurationMs { get; set; }
    public DateTime Timestamp { get; set; }
}

/// <summary>
/// Payload the gateway's ActivityLoggingFilter (and, in principle, any of the
/// other 4 Spring Boot services) POSTs to /api/logs.
/// </summary>
public class CreateLogEntryRequest
{
    public long? UserId { get; set; }
    public string Service { get; set; } = string.Empty;
    public string Endpoint { get; set; } = string.Empty;
    public string Method { get; set; } = string.Empty;
    public int StatusCode { get; set; }
    public int DurationMs { get; set; }
}
