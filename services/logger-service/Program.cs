using HireStack.LoggerService.Data;
using HireStack.LoggerService.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<LogRepository>();

// This service is only ever meant to be called by the other HireStack services
// (currently just api-gateway's ActivityLoggingFilter) over the internal network, never
// directly by a browser -- so CORS is scoped to the gateway's own origin/port rather than
// left wide open.
builder.Services.AddCors(options =>
{
    options.AddPolicy("InternalOnly", policy =>
    {
        policy.WithOrigins("http://localhost:8080")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors("InternalOnly");

app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "logger-service" }));

// Called by api-gateway's ActivityLoggingFilter (fire-and-forget) after every routed request.
app.MapPost("/api/logs", async (CreateLogEntryRequest request, LogRepository repository, CancellationToken ct) =>
{
    if (string.IsNullOrWhiteSpace(request.Service)
        || string.IsNullOrWhiteSpace(request.Endpoint)
        || string.IsNullOrWhiteSpace(request.Method))
    {
        return Results.BadRequest(new { message = "service, endpoint and method are required." });
    }

    var id = await repository.InsertAsync(request, ct);
    return Results.Created($"/api/logs/{id}", new { logId = id });
});

// Simple read-side for browsing/auditing recent activity across all 4 services --
// e.g. GET /api/logs?service=job-service&page=0&size=50
app.MapGet("/api/logs", async (string? service, int? page, int? size, LogRepository repository, CancellationToken ct) =>
{
    var effectivePage = page.GetValueOrDefault(0) < 0 ? 0 : page.GetValueOrDefault(0);
    var requestedSize = size.GetValueOrDefault(20);
    var effectiveSize = requestedSize <= 0 ? 20 : Math.Min(requestedSize, 200);

    var entries = await repository.QueryAsync(service, effectivePage, effectiveSize, ct);
    return Results.Ok(entries);
});

// A small aggregate view -- request volume per service -- to demonstrate the "centralized"
// part of "centralized activity logging" beyond just storing raw rows.
app.MapGet("/api/logs/stats/by-service", async (LogRepository repository, CancellationToken ct) =>
{
    var stats = await repository.CountByServiceAsync(ct);
    return Results.Ok(stats);
});

app.Run();
