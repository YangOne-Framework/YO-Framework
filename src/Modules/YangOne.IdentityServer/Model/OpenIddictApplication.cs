//using Microsoft.IdentityModel.Tokens;
//using System.Collections.Immutable;
//using System.Globalization;
//using System.Text.Json;

namespace YangOne.IdentityServer.Model;

///// <summary>
///// Minimal application entity for the Dapper store. Adjust columns to match your DB script/table.
///// </summary>
//public sealed class OpenIddictApplication
//{
//    public string Id { get; set; } = default!; // PK (string/Guid/Ulid serialized as text)
//    public string ClientId { get; set; } = default!;
//    public string? ClientSecret { get; set; }
//    public string? ClientType { get; set; } // OpenIddictConstants.ClientTypes
//    public string? ConsentType { get; set; } // explicit/implicit/external/system
//    public string? ApplicationType { get; set; } // e.g., web/native/spa (optional per your model)
//    public string? DisplayName { get; set; }


//    // JSON columns persisted as text/json in DB
//    public string? DisplayNames { get; set; }
//    public string? RedirectUris { get; set; }
//    public string? PostLogoutRedirectUris { get; set; }
//    public string? Permissions{ get; set; }
//    public string? Requirements { get; set; }
//    public string? Properties { get; set; }
//    public string? Settings { get; set; }
//    public string? JsonWebKeySet { get; set; }


//    // Helpers for (de)serialization
//    public static ImmutableArray<string> ParseArray(string? json)
//    => string.IsNullOrWhiteSpace(json) ? ImmutableArray<string>.Empty
//    : JsonSerializer.Deserialize<string[]>(json!)!.ToImmutableArray();


//    public static string? WriteArray(ImmutableArray<string> items)
//    => items.IsDefaultOrEmpty ? null : JsonSerializer.Serialize(items.AsEnumerable());


//    public static ImmutableDictionary<string, JsonElement> ParseDict(string? json)
//    => string.IsNullOrWhiteSpace(json)
//    ? ImmutableDictionary<string, JsonElement>.Empty
//    : JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(json!)!.ToImmutableDictionary();


//    public static string? WriteDict(ImmutableDictionary<string, JsonElement> dict)
//    => dict is null || dict.Count == 0 ? null : JsonSerializer.Serialize(dict);


//    public static ImmutableDictionary<CultureInfo, string> ParseLocalized(string? json)
//    {
//        if (string.IsNullOrWhiteSpace(json))
//            return ImmutableDictionary<CultureInfo, string>.Empty;
//        var dict = JsonSerializer.Deserialize<Dictionary<string, string>>(json!)!;
//        var builder = ImmutableDictionary.CreateBuilder<CultureInfo, string>();
//        foreach (var kvp in dict)
//            builder[new CultureInfo(kvp.Key)] = kvp.Value;
//        return builder.ToImmutable();
//    }


//    public static string? WriteLocalized(ImmutableDictionary<CultureInfo, string> names)
//    {
//        if (names is null || names.Count == 0) return null;
//        var dict = names.ToDictionary(k => k.Key.Name, v => v.Value);
//        return JsonSerializer.Serialize(dict);
//    }


//    public static ImmutableDictionary<string, string> ParseSettings(string? json)
//    => string.IsNullOrWhiteSpace(json)
//    ? ImmutableDictionary<string, string>.Empty
//    : JsonSerializer.Deserialize<Dictionary<string, string>>(json!)!.ToImmutableDictionary();


//    public static string? WriteSettings(ImmutableDictionary<string, string> settings)
//    => settings is null || settings.Count == 0 ? null : JsonSerializer.Serialize(settings);


//    public static JsonWebKeySet? ParseJwks(string? json)
//    => string.IsNullOrWhiteSpace(json) ? null : new JsonWebKeySet(json);


//    public static string? WriteJwks(JsonWebKeySet? set)
//    => set is null ? null : set.ToString();
//}

//public sealed class OpenIddictAuthorization
//{
//    public string Id { get; set; } = default!;
//    public string? ApplicationId { get; set; }
//    public string? Subject { get; set; }
//    public string? Status { get; set; }
//    public string? Type { get; set; }
//    public DateTimeOffset? CreationDate { get; set; }
//    public string? Scopes { get; set; } // array
//    public string? Properties { get; set; } // dict
//}
//public sealed class OpenIddictScope
//{
//    public string Id { get; set; } = default!;
//    public string Name { get; set; } = default!;
//    public string? Description { get; set; }
//    public string? DisplayName { get; set; }
//    public string? DisplayNames { get; set; } // localized
//    public string? Properties { get; set; }
//    public string? Resources { get; set; } // array of API resources
//}
//public sealed class OpenIddictToken
//{
//    public string Id { get; set; } = default!;
//    public string? ApplicationId { get; set; }
//    public string? AuthorizationId { get; set; }
//    public string? Subject { get; set; }
//    public string? Status { get; set; }
//    public string? Type { get; set; }
//    public string? ReferenceId { get; set; }          // hashed if you use reference tokens
//    public DateTimeOffset? CreationDate { get; set; }
//    public DateTimeOffset? ExpirationDate { get; set; }
//    public DateTimeOffset? RedemptionDate { get; set; }
//    public string? Payload { get; set; }              // JWT payload (opaque if reference)
//    public string? Properties { get; set; }
//}


public sealed class OpenIddictApplication
{
    public string Id { get; set; } = Guid.NewGuid().ToString("D");
    public string? ApplicationType { get; set; }
    public string? ClientId { get; set; }
    public string? ClientSecret { get; set; }
    public string? ClientType { get; set; }
    public string? ConcurrencyToken { get; set; }
    public string? ConsentType { get; set; }
    public string? DisplayName { get; set; }

    // JSON (nvarchar(max))
    public string? DisplayNames { get; set; }            // localized display names
    public string? JsonWebKeySet { get; set; }           // JWK set JSON
    public string? Permissions { get; set; }             // string[] JSON
    public string? PostLogoutRedirectUris { get; set; }  // string[] JSON
    public string? Properties { get; set; }              // { string: JsonElement } JSON
    public string? RedirectUris { get; set; }            // string[] JSON
    public string? Requirements { get; set; }            // string[] JSON
    public string? Settings { get; set; }                // { string: string } JSON
}
public sealed class OpenIddictAuthorization
{
    public string Id { get; set; } = Guid.NewGuid().ToString("D");
    public string? ApplicationId { get; set; }
    public string? ConcurrencyToken { get; set; }
    public DateTimeOffset? CreationDate { get; set; }

    // JSON (nvarchar(max))
    public string? Properties { get; set; }  // { string: JsonElement } JSON
    public string? Scopes { get; set; }      // string[] JSON

    public string? Status { get; set; }
    public string? Subject { get; set; }
    public string? Type { get; set; }
}

// Matches [dbo].[OpenIddictScopes]
public sealed class OpenIddictScope
{
    public string Id { get; set; } = Guid.NewGuid().ToString("D");
    public string? ConcurrencyToken { get; set; }
    public string? Description { get; set; }

    // JSON (nvarchar(max))
    public string? Descriptions { get; set; }  // { culture: string } JSON
    public string? DisplayName { get; set; }
    public string? DisplayNames { get; set; }  // { culture: string } JSON
    public string? Name { get; set; }
    public string? Properties { get; set; }    // { string: JsonElement } JSON
    public string? Resources { get; set; }     // string[] JSON
}

// Matches [dbo].[OpenIddictTokens]
public sealed class OpenIddictToken
{
    public string Id { get; set; } = Guid.NewGuid().ToString("D");
    public string? ApplicationId { get; set; }
    public string? AuthorizationId { get; set; }
    public string? ConcurrencyToken { get; set; }
    public DateTimeOffset? CreationDate { get; set; }
    public DateTimeOffset? ExpirationDate { get; set; }

    // JSON (nvarchar(max))
    public string? Payload { get; set; }       // serialized JWT or introspection payload
    public string? Properties { get; set; }    // { string: JsonElement } JSON

    public DateTimeOffset? RedemptionDate { get; set; }
    public string? ReferenceId { get; set; }
    public string? Status { get; set; }
    public string? Subject { get; set; }
    public string? Type { get; set; }
}