using System.Collections.Immutable;
using System.Data.Common;
using System.Globalization;
using System.Runtime.CompilerServices;
using System.Text.Json;
using Dapper;
using OpenIddict.Abstractions;
using YangOne.Data;
using YangOne.IdentityServer.Model;

namespace YangOne.IdentityServer.Service;
public sealed class IdentityServerScopeStore : IOpenIddictScopeStore<OpenIddictScope>
{
    private static async ValueTask<DbConnection> OpenAsync(CancellationToken ct)
    {
        var f = DbFactoryProvider.GetFactory();
        var db = (DbConnection)f.GetConnection();
        await db.OpenAsync(ct);
        return db;
    }

    // CRUD
    public async ValueTask CreateAsync(OpenIddictScope s, CancellationToken ct)
    {
        const string sql = @"
INSERT INTO [dbo].[OpenIddictScopes](
    [Id],[ConcurrencyToken],[Description],[Descriptions],[DisplayName],[DisplayNames],[Name],[Properties],[Resources])
VALUES (@Id,@ConcurrencyToken,@Description,@Descriptions,@DisplayName,@DisplayNames,@Name,@Properties,@Resources);";
        await using var db = await OpenAsync(ct);
        await db.ExecuteAsync(sql, s);
    }

    public async ValueTask UpdateAsync(OpenIddictScope s, CancellationToken ct)
    {
        const string sql = @"
UPDATE [dbo].[OpenIddictScopes] SET
    [ConcurrencyToken]=@ConcurrencyToken,
    [Description]=@Description,
    [Descriptions]=@Descriptions,
    [DisplayName]=@DisplayName,
    [DisplayNames]=@DisplayNames,
    [Name]=@Name,
    [Properties]=@Properties,
    [Resources]=@Resources
WHERE [Id]=@Id;";
        await using var db = await OpenAsync(ct);
        var n = await db.ExecuteAsync(sql, s);
        if (n == 0) throw new InvalidOperationException($"Scope not found: {s.Id}");
    }

    public async ValueTask DeleteAsync(OpenIddictScope s, CancellationToken ct)
    {
        await using var db = await OpenAsync(ct);
        await db.ExecuteAsync(@"DELETE FROM [dbo].[OpenIddictScopes] WHERE [Id]=@Id;", new { s.Id });
    }

    // Finders
    public async ValueTask<OpenIddictScope?> FindByIdAsync(string id, CancellationToken ct)
    {
        await using var db = await OpenAsync(ct);
        return await db.QueryFirstOrDefaultAsync<OpenIddictScope>(
            @"SELECT TOP (1) * FROM [dbo].[OpenIddictScopes] WHERE [Id]=@Id;", new { Id = id });
    }

    public async ValueTask<OpenIddictScope?> FindByNameAsync(string name, CancellationToken ct)
    {
        await using var db = await OpenAsync(ct);
        return await db.QueryFirstOrDefaultAsync<OpenIddictScope>(
            @"SELECT TOP (1) * FROM [dbo].[OpenIddictScopes] WHERE [Name]=@Name;", new { Name = name });
    }

    public async IAsyncEnumerable<OpenIddictScope> FindByNamesAsync(ImmutableArray<string> names, [EnumeratorCancellation] CancellationToken ct)
    {
        if (names.IsDefaultOrEmpty) yield break;
        await using var db = await OpenAsync(ct);
        var rows = await db.QueryAsync<OpenIddictScope>(
            @"SELECT * FROM [dbo].[OpenIddictScopes] WHERE [Name] IN @Names;", new { Names = names.ToArray() });
        foreach (var r in rows) yield return r;
    }

    public async IAsyncEnumerable<OpenIddictScope> FindByResourceAsync(string resource, [EnumeratorCancellation] CancellationToken ct)
    {
        await using var db = await OpenAsync(ct);
        var rows = await db.QueryAsync<OpenIddictScope>(
            @"SELECT * FROM [dbo].[OpenIddictScopes] WHERE [Resources] IS NOT NULL;");
        foreach (var r in rows)
        {
            var res = ParseArray(r.Resources);
            if (res.Contains(resource, StringComparer.Ordinal)) yield return r;
        }
    }

    // Count/List
    public async ValueTask<long> CountAsync(CancellationToken ct)
    {
        await using var db = await OpenAsync(ct);
        return await db.ExecuteScalarAsync<long>(@"SELECT COUNT_BIG(1) FROM [dbo].[OpenIddictScopes];");
    }
    public ValueTask<long> CountAsync<TResult>(Func<IQueryable<OpenIddictScope>, IQueryable<TResult>> q, CancellationToken ct)
        => throw new NotSupportedException();

    public async IAsyncEnumerable<OpenIddictScope> ListAsync(int? count, int? offset, [EnumeratorCancellation] CancellationToken ct)
    {
        var take = count is > 0 ? count.Value : 50;
        var skip = offset is > 0 ? offset.Value : 0;
        const string sql = @"
SELECT * FROM [dbo].[OpenIddictScopes]
ORDER BY [Name]
OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY;";
        await using var db = await OpenAsync(ct);
        var rows = await db.QueryAsync<OpenIddictScope>(sql, new { Skip = skip, Take = take });
        foreach (var r in rows) yield return r;
    }
    public IAsyncEnumerable<TResult> ListAsync<TState, TResult>(Func<IQueryable<OpenIddictScope>, TState, IQueryable<TResult>> q, TState s, CancellationToken ct)
        => throw new NotSupportedException();

    // Getters
    public ValueTask<string?> GetIdAsync(OpenIddictScope s, CancellationToken ct) => new(s.Id);
    public ValueTask<string?> GetNameAsync(OpenIddictScope s, CancellationToken ct) => new(s.Name);
    public ValueTask<string?> GetDescriptionAsync(OpenIddictScope s, CancellationToken ct) => new(s.Description);
    public ValueTask<string?> GetDisplayNameAsync(OpenIddictScope s, CancellationToken ct) => new(s.DisplayName);
    public ValueTask<ImmutableDictionary<CultureInfo, string>> GetDescriptionsAsync(OpenIddictScope s, CancellationToken ct) => new(ParseLocalized(s.Description));
    public ValueTask<ImmutableDictionary<CultureInfo, string>> GetDisplayNamesAsync(OpenIddictScope s, CancellationToken ct) => new(ParseLocalized(s.DisplayNames));
    public ValueTask<ImmutableDictionary<string, JsonElement>> GetPropertiesAsync(OpenIddictScope s, CancellationToken ct) => new(ParseDict(s.Properties));
    public ValueTask<ImmutableArray<string>> GetResourcesAsync(OpenIddictScope s, CancellationToken ct) => new(ParseArray(s.Resources));

    // Setters
    public ValueTask SetNameAsync(OpenIddictScope s, string? v, CancellationToken ct) { s.Name = v ?? string.Empty; return ValueTask.CompletedTask; }
    public ValueTask SetDescriptionAsync(OpenIddictScope s, string? v, CancellationToken ct) { s.Description = v; return ValueTask.CompletedTask; }
    public ValueTask SetDisplayNameAsync(OpenIddictScope s, string? v, CancellationToken ct) { s.DisplayName = v; return ValueTask.CompletedTask; }
    public ValueTask SetDescriptionsAsync(OpenIddictScope s, ImmutableDictionary<CultureInfo, string> d, CancellationToken ct) { s.Description = WriteLocalized(d); return ValueTask.CompletedTask; }
    public ValueTask SetDisplayNamesAsync(OpenIddictScope s, ImmutableDictionary<CultureInfo, string> n, CancellationToken ct) { s.DisplayNames = WriteLocalized(n); return ValueTask.CompletedTask; }
    public ValueTask SetPropertiesAsync(OpenIddictScope s, ImmutableDictionary<string, JsonElement> p, CancellationToken ct) { s.Properties = WriteDict(p); return ValueTask.CompletedTask; }
    public ValueTask SetResourcesAsync(OpenIddictScope s, ImmutableArray<string> r, CancellationToken ct) { s.Resources = WriteArray(r); return ValueTask.CompletedTask; }

    // Misc
    public ValueTask<OpenIddictScope> InstantiateAsync(CancellationToken ct) => new(new OpenIddictScope());
    public ValueTask<TResult?> GetAsync<TState, TResult>(Func<IQueryable<OpenIddictScope>, TState, IQueryable<TResult>> q, TState s, CancellationToken ct)
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
}
