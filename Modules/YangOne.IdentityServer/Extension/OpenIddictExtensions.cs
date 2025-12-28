using System.Collections.Immutable;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OpenIddict.Abstractions;
using OpenIddict.Server.AspNetCore;
using YangOne.IdentityServer.Model;
using YangOne.IdentityServer.Service;

namespace YangOne.IdentityServer;

public static class OpenIddictExtensions
{
    public static WebApplicationBuilder AddIdentityServer(this WebApplicationBuilder builder,IConfiguration configuration)
    {
        //builder.Services
        //    .AddOpenIddict()
        //    .AddServer(options =>
        //    {
        //        options.AllowClientCredentialsFlow();
        //        options.SetTokenEndpointUris("connect/token");
        //        options.AddDevelopmentEncryptionCertificate()
        //            .AddDevelopmentSigningCertificate();
        //        options.DisableAccessTokenEncryption();
        //        options.UseAspNetCore()
        //            .EnableTokenEndpointPassthrough();
        //    });

        var services = builder.Services;
        //services.AddDbContext<ApplicationDbContext>(options =>
        //{
        //    // Configure your database provider (SQL Server, PostgreSQL, etc.)
        //    //options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection"));
        //    //options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection"));
        //    options.UseSqlite($"Filename={Path.Combine(Path.GetTempPath(), "openiddict-aridka-server1.sqlite3")}");
        //    // Register the OpenIddict entity sets
        //    options.UseOpenIddict();
        //});
        services.AddOpenIddict()

    // Register the OpenIddict core components.
    .AddCore(options =>
    {
        // Configure OpenIddict to use the Entity Framework Core stores and models.
        // Note: call ReplaceDefaultEntities() to replace the default OpenIddict entities.
        //  options.UseEntityFrameworkCore()
        //   .UseDbContext<ApplicationDbContext>();

        // options.ReplaceApplicationStore<IOpenI
        // ddictApplicationStore<OpenIddictApplication>>(IOpenIddictApplicationStore<OpenIddictApplication>);
      
        options.ReplaceApplicationStore<OpenIddictApplication, IdentityServerApplicationStore>();


    })

    // Register the OpenIddict server components.
    .AddServer(options =>
    {
        // Enable the token endpoint.
        options.SetTokenEndpointUris("connect/token");

        // Enable the client credentials flow.
        options.AllowClientCredentialsFlow();

        // Register the signing and encryption credentials.
        options.AddDevelopmentEncryptionCertificate()
            .AddDevelopmentSigningCertificate();

        // Register the ASP.NET Core host and configure the ASP.NET Core-specific options.
        options.UseAspNetCore()
            .EnableTokenEndpointPassthrough();
    })

    // Register the OpenIddict validation components.
    .AddValidation(options =>
    {
        // Import the configuration from the local OpenIddict server instance.
        options.UseLocalServer();

        // Register the ASP.NET Core host.
        options.UseAspNetCore();
    });
        services.PostConfigureAll<OpenIddictServerAspNetCoreOptions>(options =>
        {
            options.DisableTransportSecurityRequirement = true;
            options.EnableStatusCodePagesIntegration = true;
        });
        //services.AddAuthentication(options =>
        //{
        //    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        //    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        //})
        //    .AddJwtBearer(options =>
        //    {
        //        options.Authority = configuration["Jwt:Authority"];
        //        options.Audience = configuration["Jwt:Audience"];
        //        options.RequireHttpsMetadata = false; // Only for development
        //    });

        return builder;
    }

}

public static class AsyncEnumerableExtensions
{
    public static Task<List<T>> ToListAsync<T>(this IAsyncEnumerable<T> source)
    {
        if (source == null)
        {
            throw new ArgumentNullException(nameof(source));
        }

        return ExecuteAsync();

        async Task<List<T>> ExecuteAsync()
        {
            var list = new List<T>();

            await foreach (var element in source)
            {
                list.Add(element);
            }

            return list;
        }
    }
}
public  static class JsonUtil
{
    public static ImmutableArray<string> ParseArray(string? json)
        => string.IsNullOrWhiteSpace(json) ? ImmutableArray<string>.Empty
            : JsonSerializer.Deserialize<string[]>(json!)!.ToImmutableArray();

    public static string? WriteArray(ImmutableArray<string> items)
        => items.IsDefaultOrEmpty ? null : JsonSerializer.Serialize(items.AsEnumerable());

    public static ImmutableDictionary<string, JsonElement> ParseDict(string? json)
        => string.IsNullOrWhiteSpace(json)
            ? ImmutableDictionary<string, JsonElement>.Empty
            : JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(json!)!.ToImmutableDictionary();

    public static string? WriteDict(ImmutableDictionary<string, JsonElement> dict)
        => dict is null || dict.Count == 0 ? null : JsonSerializer.Serialize(dict);
}