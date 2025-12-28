using Dapper;
using OpenIddict.Abstractions;
using System.Collections.Immutable;
using System.Data.Common;
using System.Runtime.CompilerServices;
using System.Text.Json;
using YangOne.Data;
using YangOne.IdentityServer.Model;

namespace YangOne.IdentityServer.Service;
public sealed class IdentityServerAuthorizationStore : IOpenIddictAuthorizationStore<OpenIddictAuthorization>
{
    private static async ValueTask<DbConnection> OpenAsync(CancellationToken ct)
    {
        var f = DbFactoryProvider.GetFactory();
        var db = (DbConnection)f.GetConnection();
        await db.OpenAsync(ct);
        return db;
    }

    // CRUD
    public async ValueTask CreateAsync(OpenIddictAuthorization a, CancellationToken ct)
    {
        const string sql = @"
INSERT INTO [dbo].[OpenIddictAuthorizations](
    [Id],[ApplicationId],[ConcurrencyToken],[CreationDate],[Properties],[Scopes],[Status],[Subject],[Type])
VALUES (@Id,@ApplicationId,@ConcurrencyToken,@CreationDate,@Properties,@Scopes,@Status,@Subject,@Type);";
        await using var db = await OpenAsync(ct);
        await db.ExecuteAsync(sql, a);
    }

    public async ValueTask UpdateAsync(OpenIddictAuthorization a, CancellationToken ct)
    {
        const string sql = @"
UPDATE [dbo].[OpenIddictAuthorizations] SET
    [ApplicationId]=@ApplicationId,
    [ConcurrencyToken]=@ConcurrencyToken,
    [CreationDate]=@CreationDate,
    [Properties]=@Properties,
    [Scopes]=@Scopes,
    [Status]=@Status,
    [Subject]=@Subject,
    [Type]=@Type
WHERE [Id]=@Id;";
        await using var db = await OpenAsync(ct);
        var n = await db.ExecuteAsync(sql, a);
        if (n == 0) throw new InvalidOperationException($"Authorization not found: {a.Id}");
    }

    public async ValueTask DeleteAsync(OpenIddictAuthorization a, CancellationToken ct)
    {
        await using var db = await OpenAsync(ct);
        await db.ExecuteAsync(@"DELETE FROM [dbo].[OpenIddictAuthorizations] WHERE [Id]=@Id;", new { a.Id });
    }

    // Finders
    public async ValueTask<OpenIddictAuthorization?> FindByIdAsync(string id, CancellationToken ct)
    {
        await using var db = await OpenAsync(ct);
        return await db.QueryFirstOrDefaultAsync<OpenIddictAuthorization>(
            @"SELECT TOP (1) * FROM [dbo].[OpenIddictAuthorizations] WHERE [Id]=@Id;", new { Id = id });
    }

    public async IAsyncEnumerable<OpenIddictAuthorization> FindByApplicationIdAsync(string appId, [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken ct)
    {
        await using var db = await OpenAsync(ct);
        var rows = await db.QueryAsync<OpenIddictAuthorization>(
            @"SELECT * FROM [dbo].[OpenIddictAuthorizations] WHERE [ApplicationId]=@AppId;", new { AppId = appId });
        foreach (var r in rows) yield return r;
    }

    public async IAsyncEnumerable<OpenIddictAuthorization> FindBySubjectAsync(string subject, [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken ct)
    {
        await using var db = await OpenAsync(ct);
        var rows = await db.QueryAsync<OpenIddictAuthorization>(
            @"SELECT * FROM [dbo].[OpenIddictAuthorizations] WHERE [Subject]=@Subject;", new { Subject = subject });
        foreach (var r in rows) yield return r;
    }

    public async IAsyncEnumerable<OpenIddictAuthorization> FindAsync(string? subject, string? client, string? status, string? type, ImmutableArray<string>? scopes, [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken ct)
    {
        const string sql = @"
SELECT a.*
FROM [dbo].[OpenIddictAuthorizations] a
LEFT JOIN [dbo].[OpenIddictApplications] app ON app.[Id] = a.[ApplicationId]
WHERE (@Subject IS NULL OR a.[Subject]=@Subject)
  AND (@ClientId IS NULL OR app.[ClientId]=@ClientId)
  AND (@Status  IS NULL OR a.[Status]=@Status)
  AND (@Type    IS NULL OR a.[Type]=@Type);";
        await using var db = await OpenAsync(ct);
        var rows = await db.QueryAsync<OpenIddictAuthorization>(sql, new { Subject = subject, ClientId = client, Status = status, Type = type });

        var needScopes = scopes is { IsDefault: false } && scopes.Value.Length > 0;
        if (!needScopes)
        {
            foreach (var r in rows) yield return r;
            yield break;
        }

        var requested = scopes!.Value.ToHashSet(StringComparer.Ordinal);
        foreach (var r in rows)
        {
            var granted = ParseArray(r.Scopes).ToHashSet(StringComparer.Ordinal);
            if (requested.All(granted.Contains)) yield return r;
        }
    }

    // Count/List/Queryable
    public async ValueTask<long> CountAsync(CancellationToken ct)
    {
        await using var db = await OpenAsync(ct);
        return await db.ExecuteScalarAsync<long>(@"SELECT COUNT_BIG(1) FROM [dbo].[OpenIddictAuthorizations];");
    }
    public ValueTask<long> CountAsync<TResult>(Func<IQueryable<OpenIddictAuthorization>, IQueryable<TResult>> query, CancellationToken ct)
        => throw new NotSupportedException();

    public ValueTask<OpenIddictAuthorization> InstantiateAsync(CancellationToken cancellationToken)
    {
        var authorization = new OpenIddictAuthorization
        {
            // If using Guid as ID:
            Id = Guid.NewGuid().ToString(),

            // Or if using string as ID:
            // Id = Guid.NewGuid().ToString(),

            CreationDate = DateTimeOffset.UtcNow
        };

        return new ValueTask<OpenIddictAuthorization>(authorization);
    }

    public async IAsyncEnumerable<OpenIddictAuthorization> ListAsync(int? count, int? offset, [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken ct)
    {
        var take = count is > 0 ? count.Value : 50;
        var skip = offset is > 0 ? offset.Value : 0;
        const string sql = @"
SELECT * FROM [dbo].[OpenIddictAuthorizations]
ORDER BY [Id]
OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY;";
        await using var db = await OpenAsync(ct);
        var rows = await db.QueryAsync<OpenIddictAuthorization>(sql, new { Skip = skip, Take = take });
        foreach (var r in rows) yield return r;
    }
    public IAsyncEnumerable<TResult> ListAsync<TState, TResult>(Func<IQueryable<OpenIddictAuthorization>, TState, IQueryable<TResult>> query, TState state, CancellationToken ct)
        => throw new NotSupportedException();

    // Revoke/Prune
    public async ValueTask<long> RevokeAsync(string? subject, string? client, string? status, string? type, CancellationToken ct)
    {
        const string sql = @"
UPDATE [dbo].[OpenIddictAuthorizations]
SET [Status]=@Revoked
WHERE (@Subject IS NULL OR [Subject]=@Subject)
  AND (@Status  IS NULL OR [Status]=@Status)
  AND (@Type    IS NULL OR [Type]=@Type)
  AND (@ClientId IS NULL OR [ApplicationId] IN (SELECT [Id] FROM [dbo].[OpenIddictApplications] WHERE [ClientId]=@ClientId));";
        await using var db = await OpenAsync(ct);
        return await db.ExecuteAsync(sql, new { Subject = subject, ClientId = client, Status = status, Type = type, Revoked = OpenIddictConstants.Statuses.Revoked });
    }

    public async ValueTask<long> RevokeByApplicationIdAsync(string appId, CancellationToken ct)
    {
        await using var db = await OpenAsync(ct);
        return await db.ExecuteAsync(@"UPDATE [dbo].[OpenIddictAuthorizations] SET [Status]=@Revoked WHERE [ApplicationId]=@Id;",
            new { Id = appId, Revoked = OpenIddictConstants.Statuses.Revoked });
    }

    public async ValueTask<long> RevokeBySubjectAsync(string subject, CancellationToken ct)
    {
        await using var db = await OpenAsync(ct);
        return await db.ExecuteAsync(@"UPDATE [dbo].[OpenIddictAuthorizations] SET [Status]=@Revoked WHERE [Subject]=@Subject;",
            new { Subject = subject, Revoked = OpenIddictConstants.Statuses.Revoked });
    }

    public async ValueTask<long> PruneAsync(DateTimeOffset threshold, CancellationToken ct)
    {
        const string sql = @"
DELETE a
FROM [dbo].[OpenIddictAuthorizations] a
WHERE (a.[CreationDate] IS NULL OR a.[CreationDate] < @Threshold)
  AND (a.[Status] IS NULL OR a.[Status] <> @Valid)
  AND NOT EXISTS (SELECT 1 FROM [dbo].[OpenIddictTokens] t WHERE t.[AuthorizationId] = a.[Id]);";
        await using var db = await OpenAsync(ct);
        return await db.ExecuteAsync(sql, new { Threshold = threshold, Valid = OpenIddictConstants.Statuses.Valid });
    }

    // Getters/Setters
    public ValueTask<string?> GetIdAsync(OpenIddictAuthorization a, CancellationToken ct) => new(a.Id);
    public ValueTask<string?> GetApplicationIdAsync(OpenIddictAuthorization a, CancellationToken ct) => new(a.ApplicationId);
    public ValueTask<string?> GetSubjectAsync(OpenIddictAuthorization a, CancellationToken ct) => new(a.Subject);
    public ValueTask<string?> GetStatusAsync(OpenIddictAuthorization a, CancellationToken ct) => new(a.Status);
    public ValueTask<string?> GetTypeAsync(OpenIddictAuthorization a, CancellationToken ct) => new(a.Type);
    public ValueTask<DateTimeOffset?> GetCreationDateAsync(OpenIddictAuthorization a, CancellationToken ct) => new(a.CreationDate);
    public ValueTask<ImmutableArray<string>> GetScopesAsync(OpenIddictAuthorization a, CancellationToken ct) => new(ParseArray(a.Scopes));
    public ValueTask<ImmutableDictionary<string, JsonElement>> GetPropertiesAsync(OpenIddictAuthorization a, CancellationToken ct) => new(ParseDict(a.Properties));

    public ValueTask SetApplicationIdAsync(OpenIddictAuthorization a, string? v, CancellationToken ct) { a.ApplicationId = v; return ValueTask.CompletedTask; }
    public ValueTask SetSubjectAsync(OpenIddictAuthorization a, string? v, CancellationToken ct) { a.Subject = v; return ValueTask.CompletedTask; }
    public ValueTask SetStatusAsync(OpenIddictAuthorization a, string? v, CancellationToken ct) { a.Status = v; return ValueTask.CompletedTask; }
    public ValueTask SetTypeAsync(OpenIddictAuthorization a, string? v, CancellationToken ct) { a.Type = v; return ValueTask.CompletedTask; }
    public ValueTask SetCreationDateAsync(OpenIddictAuthorization a, DateTimeOffset? d, CancellationToken ct) { a.CreationDate = d; return ValueTask.CompletedTask; }
    public ValueTask SetScopesAsync(OpenIddictAuthorization a, ImmutableArray<string> s, CancellationToken ct) { a.Scopes = WriteArray(s); return ValueTask.CompletedTask; }
    public ValueTask SetPropertiesAsync(OpenIddictAuthorization a, ImmutableDictionary<string, JsonElement> p, CancellationToken ct) { a.Properties = WriteDict(p); return ValueTask.CompletedTask; }

    public ValueTask<TResult?> GetAsync<TState, TResult>(Func<IQueryable<OpenIddictAuthorization>, TState, IQueryable<TResult>> query, TState state, CancellationToken ct)
        => throw new NotSupportedException();

    // JSON helpers
    private static ImmutableArray<string> ParseArray(string? json) =>
        string.IsNullOrWhiteSpace(json) ? ImmutableArray<string>.Empty : JsonSerializer.Deserialize<string[]>(json!)!.ToImmutableArray();
    private static string? WriteArray(ImmutableArray<string> items) =>
        items.IsDefaultOrEmpty ? null : JsonSerializer.Serialize(items.AsEnumerable());
    private static ImmutableDictionary<string, JsonElement> ParseDict(string? json) =>
        string.IsNullOrWhiteSpace(json) ? ImmutableDictionary<string, JsonElement>.Empty
        : JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(json!)!.ToImmutableDictionary();
    private static string? WriteDict(ImmutableDictionary<string, JsonElement> dict) =>
        dict is null || dict.Count == 0 ? null : JsonSerializer.Serialize(dict);
}
