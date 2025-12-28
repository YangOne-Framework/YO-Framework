using Dapper;
using Microsoft.IdentityModel.Tokens;
using OpenIddict.Abstractions;
using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Data.Common;
using System.Globalization;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using YangOne.Data;
using YangOne.IdentityServer.Model;

namespace YangOne.IdentityServer.Service
{

    public sealed class IdentityServerApplicationStore : IOpenIddictApplicationStore<OpenIddictApplication>
    {
        private static async ValueTask<DbConnection> OpenAsync(CancellationToken ct)
        {
            var f = DbFactoryProvider.GetFactory();
            var db = (DbConnection)f.GetConnection();
            await db.OpenAsync(ct);
            return db;
        }

        // --- Create/Update/Delete ---
        public async ValueTask CreateAsync(OpenIddictApplication app, CancellationToken ct)
        {
            const string sql = @"
INSERT INTO [dbo].[OpenIddictApplications](
    [Id],[ApplicationType],[ClientId],[ClientSecret],[ClientType],[ConcurrencyToken],[ConsentType],
    [DisplayName],[DisplayNames],[JsonWebKeySet],[Permissions],[PostLogoutRedirectUris],
    [Properties],[RedirectUris],[Requirements],[Settings])
VALUES (
    @Id,@ApplicationType,@ClientId,@ClientSecret,@ClientType,@ConcurrencyToken,@ConsentType,
    @DisplayName,@DisplayNames,@JsonWebKeySet,@Permissions,@PostLogoutRedirectUris,
    @Properties,@RedirectUris,@Requirements,@Settings);";
            await using var db = await OpenAsync(ct);
            await db.ExecuteAsync(sql, app);
        }

        public async ValueTask UpdateAsync(OpenIddictApplication app, CancellationToken ct)
        {
            const string sql = @"
UPDATE [dbo].[OpenIddictApplications] SET
    [ApplicationType]=@ApplicationType,
    [ClientId]=@ClientId,
    [ClientSecret]=@ClientSecret,
    [ClientType]=@ClientType,
    [ConcurrencyToken]=@ConcurrencyToken,
    [ConsentType]=@ConsentType,
    [DisplayName]=@DisplayName,
    [DisplayNames]=@DisplayNames,
    [JsonWebKeySet]=@JsonWebKeySet,
    [Permissions]=@Permissions,
    [PostLogoutRedirectUris]=@PostLogoutRedirectUris,
    [Properties]=@Properties,
    [RedirectUris]=@RedirectUris,
    [Requirements]=@Requirements,
    [Settings]=@Settings
WHERE [Id]=@Id;";
            await using var db = await OpenAsync(ct);
            var n = await db.ExecuteAsync(sql, app);
            if (n == 0) throw new InvalidOperationException($"Application not found: {app.Id}");
        }

        public async ValueTask DeleteAsync(OpenIddictApplication app, CancellationToken ct)
        {
            const string sql = @"DELETE FROM [dbo].[OpenIddictApplications] WHERE [Id]=@Id;";
            await using var db = await OpenAsync(ct);
            await db.ExecuteAsync(sql, new { app.Id });
        }

        // --- Finders ---
        public async ValueTask<OpenIddictApplication?> FindByIdAsync(string id, CancellationToken ct)
        {
            const string sql = @"SELECT TOP (1) * FROM [dbo].[OpenIddictApplications] WHERE [Id]=@Id;";
            await using var db = await OpenAsync(ct);
            return await db.QueryFirstOrDefaultAsync<OpenIddictApplication>(sql, new { Id = id });
        }

        public async ValueTask<OpenIddictApplication?> FindByClientIdAsync(string clientId, CancellationToken ct)
        {
            const string sql = @"SELECT TOP (1) * FROM [dbo].[OpenIddictApplications] WHERE [ClientId]=@ClientId;";
            await using var db = await OpenAsync(ct);
            return await db.QueryFirstOrDefaultAsync<OpenIddictApplication>(sql, new { ClientId = clientId });
        }

        public async IAsyncEnumerable<OpenIddictApplication> FindByRedirectUriAsync(string uri, [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken ct)
        {
            // Stored as JSON text in [RedirectUris]; filter in-memory for portability.
            const string sql = @"SELECT * FROM [dbo].[OpenIddictApplications] WHERE [RedirectUris] IS NOT NULL;";
            await using var db = await OpenAsync(ct);
            var rows = await db.QueryAsync<OpenIddictApplication>(sql);
            foreach (var a in rows)
            {
                var list = ParseArray(a.RedirectUris);
                if (list.Contains(uri, StringComparer.Ordinal)) yield return a;
            }
        }

        public async IAsyncEnumerable<OpenIddictApplication> FindByPostLogoutRedirectUriAsync(string uri, [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken ct)
        {
            const string sql = @"SELECT * FROM [dbo].[OpenIddictApplications] WHERE [PostLogoutRedirectUris] IS NOT NULL;";
            await using var db = await OpenAsync(ct);
            var rows = await db.QueryAsync<OpenIddictApplication>(sql);
            foreach (var a in rows)
            {
                var list = ParseArray(a.PostLogoutRedirectUris);
                if (list.Contains(uri, StringComparer.Ordinal)) yield return a;
            }
        }

        // --- Count/List/Queryable ---
        public async ValueTask<long> CountAsync(CancellationToken ct)
        {
            const string sql = @"SELECT COUNT_BIG(1) FROM [dbo].[OpenIddictApplications];";
            await using var db = await OpenAsync(ct);
            return await db.ExecuteScalarAsync<long>(sql);
        }
        public ValueTask<long> CountAsync<TResult>(Func<IQueryable<OpenIddictApplication>, IQueryable<TResult>> query, CancellationToken ct)
            => throw new NotSupportedException();
        public async IAsyncEnumerable<OpenIddictApplication> ListAsync(int? count, int? offset, [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken ct)
        {
            var take = count is > 0 ? count.Value : 50;
            var skip = offset is > 0 ? offset.Value : 0;
            const string sql = @"
SELECT * FROM [dbo].[OpenIddictApplications]
ORDER BY [Id]
OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY;";
            await using var db = await OpenAsync(ct);
            var rows = await db.QueryAsync<OpenIddictApplication>(sql, new { Skip = skip, Take = take });
            foreach (var a in rows) yield return a;
        }
        public IAsyncEnumerable<TResult> ListAsync<TState, TResult>(Func<IQueryable<OpenIddictApplication>, TState, IQueryable<TResult>> query, TState state, CancellationToken ct)
            => throw new NotSupportedException();

        // --- Getters/Setters required by v7 ---
        public ValueTask<OpenIddictApplication> InstantiateAsync(CancellationToken ct) => new(new OpenIddictApplication());

        public ValueTask<string?> GetIdAsync(OpenIddictApplication app, CancellationToken ct) => new(app.Id);
        public ValueTask<string?> GetClientIdAsync(OpenIddictApplication app, CancellationToken ct) => new(app.ClientId);
        public ValueTask<string?> GetClientSecretAsync(OpenIddictApplication app, CancellationToken ct) => new(app.ClientSecret);
        public ValueTask<string?> GetClientTypeAsync(OpenIddictApplication app, CancellationToken ct) => new(app.ClientType);
        public ValueTask<string?> GetConsentTypeAsync(OpenIddictApplication app, CancellationToken ct) => new(app.ConsentType);
        public ValueTask<string?> GetDisplayNameAsync(OpenIddictApplication app, CancellationToken ct) => new(app.DisplayName);
        public ValueTask<string?> GetApplicationTypeAsync(OpenIddictApplication app, CancellationToken ct) => new(app.ApplicationType);
        public ValueTask<JsonWebKeySet?> GetJsonWebKeySetAsync(OpenIddictApplication app, CancellationToken ct)
            => new(string.IsNullOrWhiteSpace(app.JsonWebKeySet) ? null : new JsonWebKeySet(app.JsonWebKeySet));
        public ValueTask<ImmutableArray<string>> GetPermissionsAsync(OpenIddictApplication app, CancellationToken ct) => new(ParseArray(app.Permissions));
        public ValueTask<ImmutableArray<string>> GetRedirectUrisAsync(OpenIddictApplication app, CancellationToken ct) => new(ParseArray(app.RedirectUris));
        public ValueTask<ImmutableArray<string>> GetPostLogoutRedirectUrisAsync(OpenIddictApplication app, CancellationToken ct) => new(ParseArray(app.PostLogoutRedirectUris));
        public ValueTask<ImmutableArray<string>> GetRequirementsAsync(OpenIddictApplication app, CancellationToken ct) => new(ParseArray(app.Requirements));
        public ValueTask<ImmutableDictionary<string, JsonElement>> GetPropertiesAsync(OpenIddictApplication app, CancellationToken ct) => new(ParseDict(app.Properties));
        public ValueTask<ImmutableDictionary<string, string>> GetSettingsAsync(OpenIddictApplication app, CancellationToken ct) => new(ParseSettings(app.Settings));
        public ValueTask<ImmutableDictionary<CultureInfo, string>> GetDisplayNamesAsync(OpenIddictApplication app, CancellationToken ct) => new(ParseLocalized(app.DisplayNames));

        public ValueTask SetClientIdAsync(OpenIddictApplication app, string? v, CancellationToken ct) { app.ClientId = v; return ValueTask.CompletedTask; }
        public ValueTask SetClientSecretAsync(OpenIddictApplication app, string? v, CancellationToken ct) { app.ClientSecret = v; return ValueTask.CompletedTask; }
        public ValueTask SetClientTypeAsync(OpenIddictApplication app, string? v, CancellationToken ct) { app.ClientType = v; return ValueTask.CompletedTask; }
        public ValueTask SetConsentTypeAsync(OpenIddictApplication app, string? v, CancellationToken ct) { app.ConsentType = v; return ValueTask.CompletedTask; }
        public ValueTask SetDisplayNameAsync(OpenIddictApplication app, string? v, CancellationToken ct) { app.DisplayName = v; return ValueTask.CompletedTask; }
        public ValueTask SetApplicationTypeAsync(OpenIddictApplication app, string? v, CancellationToken ct) { app.ApplicationType = v; return ValueTask.CompletedTask; }
        public ValueTask SetJsonWebKeySetAsync(OpenIddictApplication app, JsonWebKeySet? set, CancellationToken ct) { app.JsonWebKeySet = set?.ToString(); return ValueTask.CompletedTask; }
        public ValueTask SetPermissionsAsync(OpenIddictApplication app, ImmutableArray<string> v, CancellationToken ct) { app.Permissions = WriteArray(v); return ValueTask.CompletedTask; }
        public ValueTask SetRedirectUrisAsync(OpenIddictApplication app, ImmutableArray<string> v, CancellationToken ct) { app.RedirectUris = WriteArray(v); return ValueTask.CompletedTask; }
        public ValueTask SetPostLogoutRedirectUrisAsync(OpenIddictApplication app, ImmutableArray<string> v, CancellationToken ct) { app.PostLogoutRedirectUris = WriteArray(v); return ValueTask.CompletedTask; }
        public ValueTask SetRequirementsAsync(OpenIddictApplication app, ImmutableArray<string> v, CancellationToken ct) { app.Requirements = WriteArray(v); return ValueTask.CompletedTask; }
        public ValueTask SetPropertiesAsync(OpenIddictApplication app, ImmutableDictionary<string, JsonElement> v, CancellationToken ct) { app.Properties = WriteDict(v); return ValueTask.CompletedTask; }
        public ValueTask SetSettingsAsync(OpenIddictApplication app, ImmutableDictionary<string, string> v, CancellationToken ct) { app.Settings = WriteSettings(v); return ValueTask.CompletedTask; }
        public ValueTask SetDisplayNamesAsync(OpenIddictApplication app, ImmutableDictionary<CultureInfo, string> v, CancellationToken ct) { app.DisplayNames = WriteLocalized(v); return ValueTask.CompletedTask; }

        public ValueTask<TResult?> GetAsync<TState, TResult>(Func<IQueryable<OpenIddictApplication>, TState, IQueryable<TResult>> query, TState state, CancellationToken ct)
            => throw new NotSupportedException();

        // --- JSON helpers (store JSON in nvarchar(max)) ---
        private static ImmutableArray<string> ParseArray(string? json) =>
            string.IsNullOrWhiteSpace(json) ? ImmutableArray<string>.Empty : JsonSerializer.Deserialize<string[]>(json!)!.ToImmutableArray();

        private static string? WriteArray(ImmutableArray<string> items) =>
            items.IsDefaultOrEmpty ? null : JsonSerializer.Serialize(items.AsEnumerable());

        private static ImmutableDictionary<string, JsonElement> ParseDict(string? json) =>
            string.IsNullOrWhiteSpace(json) ? ImmutableDictionary<string, JsonElement>.Empty
            : JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(json!)!.ToImmutableDictionary();

        private static string? WriteDict(ImmutableDictionary<string, JsonElement> dict) =>
            dict is null || dict.Count == 0 ? null : JsonSerializer.Serialize(dict);

        private static ImmutableDictionary<CultureInfo, string> ParseLocalized(string? json)
        {
            if (string.IsNullOrWhiteSpace(json)) return ImmutableDictionary<CultureInfo, string>.Empty;
            var raw = JsonSerializer.Deserialize<Dictionary<string, string>>(json!)!;
            var b = ImmutableDictionary.CreateBuilder<CultureInfo, string>();
            foreach (var kv in raw) b[new CultureInfo(kv.Key)] = kv.Value;
            return b.ToImmutable();
        }
        private static string? WriteLocalized(ImmutableDictionary<CultureInfo, string> names) =>
            names is null || names.Count == 0 ? null : JsonSerializer.Serialize(names.ToDictionary(k => k.Key.Name, v => v.Value));

        private static ImmutableDictionary<string, string> ParseSettings(string? json) =>
            string.IsNullOrWhiteSpace(json) ? ImmutableDictionary<string, string>.Empty
            : JsonSerializer.Deserialize<Dictionary<string, string>>(json!)!.ToImmutableDictionary();
        private static string? WriteSettings(ImmutableDictionary<string, string> settings) =>
            settings is null || settings.Count == 0 ? null : JsonSerializer.Serialize(settings);
    }


}
