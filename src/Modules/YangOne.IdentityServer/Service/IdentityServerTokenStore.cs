using Dapper;
using OpenIddict.Abstractions;
using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Data.Common;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using YangOne.Data;
using YangOne.IdentityServer.Model;

namespace YangOne.IdentityServer.Service;

public sealed class IdentityServerTokenStore : IOpenIddictTokenStore<OpenIddictToken>
{
    private const string AuthorizationCodeType = "urn:openiddict:params:oauth:token-type:authorization_code";
    private const string AccessTokenType = "urn:ietf:params:oauth:token-type:access_token";
    private const string RefreshTokenType = "urn:ietf:params:oauth:token-type:refresh_token";
    private static async ValueTask<DbConnection> OpenAsync(CancellationToken ct)
    {
        var f = DbFactoryProvider.GetFactory();
        var db = (DbConnection)f.GetConnection();
        await db.OpenAsync(ct);
        return db;
    }

    // CRUD
//    public async ValueTask CreateAsync(OpenIddictToken t, CancellationToken ct)
//    {
//        const string sql = @"
//INSERT INTO [dbo].[OpenIddictTokens](
//    [Id],[ApplicationId],[AuthorizationId],[ConcurrencyToken],[CreationDate],[ExpirationDate],
//    [Payload],[Properties],[RedemptionDate],[ReferenceId],[Status],[Subject],[Type])
//VALUES (@Id,@ApplicationId,@AuthorizationId,@ConcurrencyToken,@CreationDate,@ExpirationDate,
//        @Payload,@Properties,@RedemptionDate,@ReferenceId,@Status,@Subject,@Type);";
//        await using var db = await OpenAsync(ct);
//        await db.ExecuteAsync(sql, t);
//    }
    public async ValueTask CreateAsync(OpenIddictToken t, CancellationToken ct)
    {
        Console.WriteLine($"DEBUG - Creating token: {t.Id}, Type: {t.Type}, Status: {t.Status}");

        // CRITICAL: Ensure ConcurrencyToken is set!
        if (string.IsNullOrEmpty(t.ConcurrencyToken))
        {
            t.ConcurrencyToken = Guid.NewGuid().ToString();
            Console.WriteLine($"DEBUG - Generated ConcurrencyToken: {t.ConcurrencyToken}");
        }

        // Ensure other required fields have values
        if (!t.CreationDate.HasValue)
        {
            t.CreationDate = DateTimeOffset.UtcNow;
        }

        // For authorization codes, set expiration if not set
        if (t.Type == AuthorizationCodeType && !t.ExpirationDate.HasValue)
        {
            t.ExpirationDate = DateTimeOffset.UtcNow.AddMinutes(5); // Default 5 min expiry
        }

        const string sql = @"
INSERT INTO [dbo].[OpenIddictTokens](
    [Id],[ApplicationId],[AuthorizationId],[ConcurrencyToken],[CreationDate],[ExpirationDate],
    [Payload],[Properties],[RedemptionDate],[ReferenceId],[Status],[Subject],[Type])
VALUES (@Id,@ApplicationId,@AuthorizationId,@ConcurrencyToken,@CreationDate,@ExpirationDate,
        @Payload,@Properties,@RedemptionDate,@ReferenceId,@Status,@Subject,@Type);";

        await using var db = await OpenAsync(ct);

        // Log the values being inserted
        Console.WriteLine($"DEBUG - Inserting token with ConcurrencyToken: {t.ConcurrencyToken}");

        await db.ExecuteAsync(sql, t);

        Console.WriteLine($"DEBUG - Token created successfully: {t.Id}");
    }
    public async ValueTask UpdateAsync(OpenIddictToken t, CancellationToken ct)
    {
        await using var db = await OpenAsync(ct);

        // Load the current concurrency token from DB (authoritative)
        var current = await db.ExecuteScalarAsync<string?>(
            @"SELECT [ConcurrencyToken] FROM [dbo].[OpenIddictTokens] WHERE [Id]=@Id;",
            new { t.Id });

        if (current is null)
            throw new InvalidOperationException($"Token not found: {t.Id}");

        var oldConcurrencyToken = current;
        var newConcurrencyToken = Guid.NewGuid().ToString();

        const string sql = @"
UPDATE [dbo].[OpenIddictTokens] SET
    [ApplicationId]=@ApplicationId,
    [AuthorizationId]=@AuthorizationId,
    [ConcurrencyToken]=@NewConcurrencyToken,
    [CreationDate]=@CreationDate,
    [ExpirationDate]=@ExpirationDate,
    [Payload]=@Payload,
    [Properties]=@Properties,
    [RedemptionDate]=@RedemptionDate,
    [ReferenceId]=@ReferenceId,
    [Status]=@Status,
    [Subject]=@Subject,
    [Type]=@Type
WHERE [Id]=@Id AND [ConcurrencyToken]=@OldConcurrencyToken;";

        var n = await db.ExecuteAsync(sql, new
        {
            t.Id,
            t.ApplicationId,
            t.AuthorizationId,
            t.CreationDate,
            t.ExpirationDate,
            t.Payload,
            t.Properties,
            t.RedemptionDate,
            t.ReferenceId,
            t.Status,
            t.Subject,
            t.Type,
            OldConcurrencyToken = oldConcurrencyToken,
            NewConcurrencyToken = newConcurrencyToken
        });

        if (n == 0)
            throw new InvalidOperationException($"Concurrency conflict updating token {t.Id}");

        // keep in-memory in sync
        t.ConcurrencyToken = newConcurrencyToken;
    }

//    public async ValueTask UpdateAsync(OpenIddictToken t, CancellationToken ct)
//    {
//        const string sql = @"
//UPDATE [dbo].[OpenIddictTokens] SET
//    [ApplicationId]=@ApplicationId,
//    [AuthorizationId]=@AuthorizationId,
//    [ConcurrencyToken]=@ConcurrencyToken,
//    [CreationDate]=@CreationDate,
//    [ExpirationDate]=@ExpirationDate,
//    [Payload]=@Payload,
//    [Properties]=@Properties,
//    [RedemptionDate]=@RedemptionDate,
//    [ReferenceId]=@ReferenceId,
//    [Status]=@Status,
//    [Subject]=@Subject,
//    [Type]=@Type
//WHERE [Id]=@Id;";
//        await using var db = await OpenAsync(ct);
//        var n = await db.ExecuteAsync(sql, t);
//        if (n == 0) throw new InvalidOperationException($"Token not found: {t.Id}");
//    }
    //    public async ValueTask UpdateAsync(OpenIddictToken t, CancellationToken ct)
    //    {
    //        // Update concurrency token before saving
    //        t.ConcurrencyToken = Guid.NewGuid().ToString();

    //        const string sql = @"
    //UPDATE [dbo].[OpenIddictTokens] SET
    //    [ApplicationId]=@ApplicationId,
    //    [AuthorizationId]=@AuthorizationId,
    //    [ConcurrencyToken]=@ConcurrencyToken,
    //    [CreationDate]=@CreationDate,
    //    [ExpirationDate]=@ExpirationDate,
    //    [Payload]=@Payload,
    //    [Properties]=@Properties,
    //    [RedemptionDate]=@RedemptionDate,
    //    [ReferenceId]=@ReferenceId,
    //    [Status]=@Status,
    //    [Subject]=@Subject,
    //    [Type]=@Type
    //WHERE [Id]=@Id AND [ConcurrencyToken]=@OldConcurrencyToken;"; // Optimistic concurrency

    //        await using var db = await OpenAsync(ct);

    //        // You need to track old concurrency token
    //        var oldToken = t.ConcurrencyToken;
    //        t.ConcurrencyToken = Guid.NewGuid().ToString();

    //        var n = await db.ExecuteAsync(sql, new
    //        {
    //            t.Id,
    //            t.ApplicationId,
    //            t.AuthorizationId,
    //            t.ConcurrencyToken,
    //            t.CreationDate,
    //            t.ExpirationDate,
    //            t.Payload,
    //            t.Properties,
    //            t.RedemptionDate,
    //            t.ReferenceId,
    //            t.Status,
    //            t.Subject,
    //            t.Type,
    //            OldConcurrencyToken = oldToken
    //        });

    //        if (n == 0) throw new InvalidOperationException($"Token not found or concurrency conflict: {t.Id}");
    //    }

    public async ValueTask DeleteAsync(OpenIddictToken t, CancellationToken ct)
    {
        await using var db = await OpenAsync(ct);
        await db.ExecuteAsync(@"DELETE FROM [dbo].[OpenIddictTokens] WHERE [Id]=@Id;", new { t.Id });
    }

    // Finders
    public async ValueTask<OpenIddictToken?> FindByIdAsync(string id, CancellationToken ct)
    {
        await using var db = await OpenAsync(ct);
        return await db.QueryFirstOrDefaultAsync<OpenIddictToken>(
            @"SELECT TOP (1) * FROM [dbo].[OpenIddictTokens] WHERE [Id]=@Id;", new { Id = id });
    }

    public async ValueTask<OpenIddictToken?> FindByReferenceIdAsync(string refId, CancellationToken ct)
    {
       
        await using var db = await OpenAsync(ct);
        var x= await db.QueryFirstOrDefaultAsync<OpenIddictToken>(
            @"SELECT TOP (1) * FROM [dbo].[OpenIddictTokens] WHERE [ReferenceId]=@Ref;", new { Ref = refId });
        return x;
    }

    public async IAsyncEnumerable<OpenIddictToken> FindByApplicationIdAsync(string appId, [EnumeratorCancellation] CancellationToken ct)
    {
        await using var db = await OpenAsync(ct);
        var rows = await db.QueryAsync<OpenIddictToken>(
            @"SELECT * FROM [dbo].[OpenIddictTokens] WHERE [ApplicationId]=@AppId;", new { AppId = appId });
        foreach (var r in rows) yield return r;
    }

    public async IAsyncEnumerable<OpenIddictToken> FindByAuthorizationIdAsync(string authId, [EnumeratorCancellation] CancellationToken ct)
    {
        await using var db = await OpenAsync(ct);
        var rows = await db.QueryAsync<OpenIddictToken>(
            @"SELECT * FROM [dbo].[OpenIddictTokens] WHERE [AuthorizationId]=@AuthId;", new { AuthId = authId });
        foreach (var r in rows) yield return r;
    }

    public async IAsyncEnumerable<OpenIddictToken> FindBySubjectAsync(string subject, [EnumeratorCancellation] CancellationToken ct)
    {
        await using var db = await OpenAsync(ct);
        var rows = await db.QueryAsync<OpenIddictToken>(
            @"SELECT * FROM [dbo].[OpenIddictTokens] WHERE [Subject]=@Subject;", new { Subject = subject });
        foreach (var r in rows) yield return r;
    }

    //    public async IAsyncEnumerable<OpenIddictToken> FindAsync(string? subject, string? client, string? status, string? type, [EnumeratorCancellation] CancellationToken ct)
    //    {
    //        const string sql = @"
    //SELECT t.*
    //FROM [dbo].[OpenIddictTokens] t
    //LEFT JOIN [dbo].[OpenIddictApplications] app ON app.[Id] = t.[ApplicationId]
    //WHERE (@Subject IS NULL OR t.[Subject]=@Subject)
    //  AND (@ClientId IS NULL OR app.[ClientId]=@ClientId)
    //  AND (@Status  IS NULL OR t.[Status]=@Status)
    //  AND (@Type    IS NULL OR t.[Type]=@Type);";
    //        await using var db = await OpenAsync(ct);
    //        var rows = await db.QueryAsync<OpenIddictToken>(sql, new { Subject = subject, ClientId = client, Status = status, Type = type });
    //        foreach (var r in rows) yield return r;
    //    }
    public async IAsyncEnumerable<OpenIddictToken> FindAsync(
        string? subject, string? client, string? status, string? type,
        [EnumeratorCancellation] CancellationToken ct)
    {
        Console.WriteLine($"FindAsync called - Subject: {subject}, Client: {client}, Status: {status}, Type: {type}");

        const string sql = @"
SELECT t.*
FROM [dbo].[OpenIddictTokens] t
LEFT JOIN [dbo].[OpenIddictApplications] app ON app.[Id] = t.[ApplicationId]
WHERE (@Subject IS NULL OR t.[Subject]=@Subject)
  AND (@ClientId IS NULL OR app.[ClientId]=@ClientId)
  AND (@Status  IS NULL OR t.[Status]=@Status)
  AND (@Type    IS NULL OR t.[Type]=@Type);";

        await using var db = await OpenAsync(ct);
        var rows = await db.QueryAsync<OpenIddictToken>(sql, new
        {
            Subject = subject,
            ClientId = client,
            Status = status,
            Type = type
        });

        foreach (var r in rows)
        {
            Console.WriteLine($"Found token: {r.Id}, Status: {r.Status}, Type: {r.Type}");
            yield return r;
        }
    }
  

    // Count/List
    public async ValueTask<long> CountAsync(CancellationToken ct)
    {
        await using var db = await OpenAsync(ct);
        return await db.ExecuteScalarAsync<long>(@"SELECT COUNT_BIG(1) FROM [dbo].[OpenIddictTokens];");
    }
    public ValueTask<long> CountAsync<TResult>(Func<IQueryable<OpenIddictToken>, IQueryable<TResult>> q, CancellationToken ct)
        => throw new NotSupportedException();

    public async IAsyncEnumerable<OpenIddictToken> ListAsync(int? count, int? offset, [EnumeratorCancellation] CancellationToken ct)
    {
        var take = count is > 0 ? count.Value : 50;
        var skip = offset is > 0 ? offset.Value : 0;
        const string sql = @"
SELECT * FROM [dbo].[OpenIddictTokens]
ORDER BY [CreationDate] DESC
OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY;";
        await using var db = await OpenAsync(ct);
        var rows = await db.QueryAsync<OpenIddictToken>(sql, new { Skip = skip, Take = take });
        foreach (var r in rows) yield return r;
    }
    public IAsyncEnumerable<TResult> ListAsync<TState, TResult>(Func<IQueryable<OpenIddictToken>, TState, IQueryable<TResult>> q, TState s, CancellationToken ct)
        => throw new NotSupportedException();

    // Revoke/Prune
    public async ValueTask<long> RevokeAsync(string? subject, string? client, string? status, string? type, CancellationToken ct)
    {
        const string sql = @"
UPDATE [dbo].[OpenIddictTokens]
SET [Status]=@Revoked
WHERE (@Subject IS NULL OR [Subject]=@Subject)
  AND (@Status  IS NULL OR [Status]=@Status)
  AND (@Type    IS NULL OR [Type]=@Type)
  AND (@ClientId IS NULL OR [ApplicationId] IN (SELECT [Id] FROM [dbo].[OpenIddictApplications] WHERE [ClientId]=@ClientId));";
        await using var db = await OpenAsync(ct);
        return await db.ExecuteAsync(sql, new { Subject = subject, ClientId = client, Status = status, Type = type, Revoked = OpenIddictConstants.Statuses.Revoked });
    }

    public async ValueTask<long> RevokeByApplicationIdAsync(string appId, CancellationToken ct = default)
    {
        await using var db = await OpenAsync(ct);
        return await db.ExecuteAsync(@"UPDATE [dbo].[OpenIddictTokens] SET [Status]=@Revoked WHERE [ApplicationId]=@Id;",
            new { Id = appId, Revoked = OpenIddictConstants.Statuses.Revoked });
    }

    public async ValueTask<long> RevokeByAuthorizationIdAsync(string authId, CancellationToken ct)
    {
        await using var db = await OpenAsync(ct);
        return await db.ExecuteAsync(@"UPDATE [dbo].[OpenIddictTokens] SET [Status]=@Revoked WHERE [AuthorizationId]=@Id;",
            new { Id = authId, Revoked = OpenIddictConstants.Statuses.Revoked });
    }

    public async ValueTask<long> RevokeBySubjectAsync(string subject, CancellationToken ct = default)
    {
        await using var db = await OpenAsync(ct);
        return await db.ExecuteAsync(@"UPDATE [dbo].[OpenIddictTokens] SET [Status]=@Revoked WHERE [Subject]=@Subject;",
            new { Subject = subject, Revoked = OpenIddictConstants.Statuses.Revoked });
    }

    public async ValueTask<long> PruneAsync(DateTimeOffset threshold, CancellationToken ct)
    {
        const string sql = @"
DELETE FROM [dbo].[OpenIddictTokens]
WHERE ([CreationDate] IS NULL OR [CreationDate] < @Threshold)
  AND (
        ([Status] IS NULL OR [Status] <> @Valid)
        OR ([ExpirationDate] IS NOT NULL AND [ExpirationDate] < @Threshold)
        OR ([RedemptionDate] IS NOT NULL AND [RedemptionDate] < @Threshold)
      );";
        await using var db = await OpenAsync(ct);
        return await db.ExecuteAsync(sql, new { Threshold = threshold, Valid = OpenIddictConstants.Statuses.Valid });
    }

    // Getters
    public ValueTask<string?> GetIdAsync(OpenIddictToken t, CancellationToken ct) => new(t.Id);
    public ValueTask<string?> GetApplicationIdAsync(OpenIddictToken t, CancellationToken ct) => new(t.ApplicationId);
    public ValueTask<string?> GetAuthorizationIdAsync(OpenIddictToken t, CancellationToken ct) => new(t.AuthorizationId);
    public ValueTask<string?> GetSubjectAsync(OpenIddictToken t, CancellationToken ct) => new(t.Subject);
    public ValueTask<string?> GetStatusAsync(OpenIddictToken t, CancellationToken ct) => new(t.Status);
    public ValueTask<string?> GetTypeAsync(OpenIddictToken t, CancellationToken ct) => new(t.Type);
    public ValueTask<string?> GetReferenceIdAsync(OpenIddictToken t, CancellationToken ct) => new(t.ReferenceId);
    public ValueTask<DateTimeOffset?> GetCreationDateAsync(OpenIddictToken t, CancellationToken ct) => new(t.CreationDate);
    public ValueTask<DateTimeOffset?> GetExpirationDateAsync(OpenIddictToken t, CancellationToken ct) => new(t.ExpirationDate);
    public ValueTask<DateTimeOffset?> GetRedemptionDateAsync(OpenIddictToken t, CancellationToken ct) => new(t.RedemptionDate);
    public ValueTask<string?> GetPayloadAsync(OpenIddictToken t, CancellationToken ct) => new(t.Payload);
    public ValueTask<ImmutableDictionary<string, JsonElement>> GetPropertiesAsync(OpenIddictToken t, CancellationToken ct) => new(ParseDict(t.Properties));

    // Setters
    public ValueTask SetApplicationIdAsync(OpenIddictToken t, string? v, CancellationToken ct) { t.ApplicationId = v; return ValueTask.CompletedTask; }
    public ValueTask SetAuthorizationIdAsync(OpenIddictToken t, string? v, CancellationToken ct) { t.AuthorizationId = v; return ValueTask.CompletedTask; }
    public ValueTask SetSubjectAsync(OpenIddictToken t, string? v, CancellationToken ct) { t.Subject = v; return ValueTask.CompletedTask; }
    public ValueTask SetStatusAsync(OpenIddictToken t, string? v, CancellationToken ct) { t.Status = v; return ValueTask.CompletedTask; }
    public ValueTask SetTypeAsync(OpenIddictToken t, string? v, CancellationToken ct) { t.Type = v; return ValueTask.CompletedTask; }

    public ValueTask SetReferenceIdAsync(OpenIddictToken t, string? v, CancellationToken ct)
    {
        Console.WriteLine($"[TokenStore] SetReferenceId: tokenId={t.Id} type={t.Type} referenceId={v}");

        t.ReferenceId = v;
        // Persist immediately when possible (prevents "created before reference id" issues).
        if (!string.IsNullOrWhiteSpace(t.Id) && !string.IsNullOrWhiteSpace(v))
        {
            _ = PersistReferenceIdAsync(t.Id, v, ct); // fire-and-forget; see below
        }
        return ValueTask.CompletedTask;
    }
    private static async Task PersistReferenceIdAsync(string tokenId, string referenceId, CancellationToken ct)
    {
        try
        {
            await using var db = await OpenAsync(ct);
            await db.ExecuteAsync(
                @"UPDATE [dbo].[OpenIddictTokens] SET [ReferenceId]=@Ref WHERE [Id]=@Id;",
                new { Id = tokenId, Ref = referenceId });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[TokenStore] ERROR persisting ReferenceId for token {tokenId}: {ex}");
            // Do not throw here; OpenIddict pipeline may still call UpdateAsync later.
        }
    }
    public ValueTask SetCreationDateAsync(OpenIddictToken t, DateTimeOffset? d, CancellationToken ct) { t.CreationDate = d; return ValueTask.CompletedTask; }
    public ValueTask SetExpirationDateAsync(OpenIddictToken t, DateTimeOffset? d, CancellationToken ct) { t.ExpirationDate = d; return ValueTask.CompletedTask; }
    public ValueTask SetRedemptionDateAsync(OpenIddictToken t, DateTimeOffset? d, CancellationToken ct) { t.RedemptionDate = d; return ValueTask.CompletedTask; }
    public ValueTask SetPayloadAsync(OpenIddictToken t, string? p, CancellationToken ct) { t.Payload = p; return ValueTask.CompletedTask; }
    public ValueTask SetPropertiesAsync(OpenIddictToken t, ImmutableDictionary<string, JsonElement> props, CancellationToken ct) { t.Properties = WriteDict(props); return ValueTask.CompletedTask; }

    public ValueTask<OpenIddictToken> InstantiateAsync(CancellationToken ct) => new(new OpenIddictToken());

    public ValueTask<TResult?> GetAsync<TState, TResult>(Func<IQueryable<OpenIddictToken>, TState, IQueryable<TResult>> q, TState s, CancellationToken ct)
        => throw new NotSupportedException("IQueryable-based queries are not supported by the Dapper-backed store.");

    // JSON helpers
    private static ImmutableDictionary<string, JsonElement> ParseDict(string? json) =>
        string.IsNullOrWhiteSpace(json) ? ImmutableDictionary<string, JsonElement>.Empty
        : JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(json!)!.ToImmutableDictionary();
    private static string? WriteDict(ImmutableDictionary<string, JsonElement> dict) =>
        dict is null || dict.Count == 0 ? null : JsonSerializer.Serialize(dict);
}

