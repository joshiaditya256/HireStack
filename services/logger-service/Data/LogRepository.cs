using HireStack.LoggerService.Models;
using MySqlConnector;

namespace HireStack.LoggerService.Data;

/// <summary>
/// Plain ADO.NET access to the shared MySQL "jobConnect" database's "logs" table.
/// No ORM/EF Core needed for a single-table, write-heavy/read-light service like this one --
/// keeping it to raw parameterized SQL via MySqlConnector keeps the dependency surface small
/// and the query plans obvious, which matters for a service whose entire job is to be a cheap,
/// low-latency sink for fire-and-forget log writes from every other service.
/// </summary>
public class LogRepository
{
    private readonly string _connectionString;

    public LogRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("HireStackDb")
            ?? throw new InvalidOperationException(
                "Missing 'ConnectionStrings:HireStackDb' configuration value.");
    }

    public async Task<long> InsertAsync(CreateLogEntryRequest request, CancellationToken ct = default)
    {
        const string sql = @"
            INSERT INTO logs (user_id, service, endpoint, method, status_code, duration_ms, timestamp)
            VALUES (@userId, @service, @endpoint, @method, @statusCode, @durationMs, UTC_TIMESTAMP());
            SELECT LAST_INSERT_ID();";

        await using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync(ct);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@userId", (object?)request.UserId ?? DBNull.Value);
        command.Parameters.AddWithValue("@service", request.Service);
        command.Parameters.AddWithValue("@endpoint", request.Endpoint);
        command.Parameters.AddWithValue("@method", request.Method);
        command.Parameters.AddWithValue("@statusCode", request.StatusCode);
        command.Parameters.AddWithValue("@durationMs", request.DurationMs);

        var result = await command.ExecuteScalarAsync(ct);
        return Convert.ToInt64(result);
    }

    public async Task<List<LogEntry>> QueryAsync(string? service, int page, int size, CancellationToken ct = default)
    {
        var entries = new List<LogEntry>();
        var whereClause = string.IsNullOrWhiteSpace(service) ? string.Empty : "WHERE service = @service";
        var sql = $@"
            SELECT log_id, user_id, service, endpoint, method, status_code, duration_ms, timestamp
            FROM logs
            {whereClause}
            ORDER BY timestamp DESC
            LIMIT @size OFFSET @offset;";

        await using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync(ct);

        await using var command = new MySqlCommand(sql, connection);
        if (!string.IsNullOrWhiteSpace(service))
        {
            command.Parameters.AddWithValue("@service", service);
        }
        command.Parameters.AddWithValue("@size", size);
        command.Parameters.AddWithValue("@offset", page * size);

        await using var reader = await command.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct))
        {
            entries.Add(new LogEntry
            {
                LogId = reader.GetInt64(0),
                UserId = reader.IsDBNull(1) ? null : reader.GetInt64(1),
                Service = reader.GetString(2),
                Endpoint = reader.GetString(3),
                Method = reader.GetString(4),
                StatusCode = reader.GetInt32(5),
                DurationMs = reader.GetInt32(6),
                Timestamp = reader.GetDateTime(7),
            });
        }
        return entries;
    }

    public async Task<Dictionary<string, long>> CountByServiceAsync(CancellationToken ct = default)
    {
        const string sql = "SELECT service, COUNT(*) FROM logs GROUP BY service ORDER BY COUNT(*) DESC;";
        var result = new Dictionary<string, long>();

        await using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync(ct);

        await using var command = new MySqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct))
        {
            result[reader.GetString(0)] = reader.GetInt64(1);
        }
        return result;
    }
}
