using System.Text.Json;
using Microsoft.AspNetCore.Hosting;

namespace YangOne.Web.Security.API;

public class ApiConfigService : IApiConfigService
{
    private readonly string _configPath;
    private readonly JsonSerializerOptions _jsonOptions;

    public ApiConfigService(IWebHostEnvironment env)
    {
        var appData = Path.Combine(env.ContentRootPath, "App_Data");
        if (!Directory.Exists(appData))
        {
            Directory.CreateDirectory(appData);
        }

        _configPath = Path.Combine(appData, "apiconfig.json");

        _jsonOptions = new JsonSerializerOptions
        {
            WriteIndented = true
        };
    }

    public async Task<ApiConfig> GetConfigAsync()
    {
        if (!File.Exists(_configPath))
        {
            return new ApiConfig
            {
                UseEncryption = false,
                UseObfusication = false
            };
        }

        var json = await File.ReadAllTextAsync(_configPath);
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        var result = new ApiConfig();

        if (root.TryGetProperty("APIConfig", out var apiConfigElement) &&
            apiConfigElement.ValueKind == JsonValueKind.Object)
        {
            if (apiConfigElement.TryGetProperty("UseEncryption", out var encProp) &&
                (encProp.ValueKind == JsonValueKind.True || encProp.ValueKind == JsonValueKind.False))
            {
                result.UseEncryption = encProp.GetBoolean();
            }

            if (apiConfigElement.TryGetProperty("UseObfusication", out var obfProp) &&
                (obfProp.ValueKind == JsonValueKind.True || obfProp.ValueKind == JsonValueKind.False))
            {
                result.UseObfusication = obfProp.GetBoolean();
            }

            if (apiConfigElement.TryGetProperty("ObfuscationKey", out var obfKey) &&
                obfKey.ValueKind == JsonValueKind.String)
            {
                result.ObfuscationKey = obfKey.GetString();
            }

            if (apiConfigElement.TryGetProperty("EncryptionKey", out var encKey) &&
                encKey.ValueKind == JsonValueKind.String)
            {
                result.EncryptionKey = encKey.GetString();
            }

            if (apiConfigElement.TryGetProperty("EncryptionIV", out var encIv) &&
                encIv.ValueKind == JsonValueKind.String)
            {
                result.EncryptionIV = encIv.GetString();
            }
        }

        return result;
    }

    public async Task SaveConfigAsync(ApiConfig config)
    {
        var root = new Dictionary<string, object>
        {
            ["APIConfig"] = new
            {
                UseEncryption = config.UseEncryption,
                UseObfusication = config.UseObfusication,
                ObfuscationKey = config.ObfuscationKey,
                EncryptionKey = config.EncryptionKey,
                EncryptionIV = config.EncryptionIV
            }
        };

        var json = JsonSerializer.Serialize(root, _jsonOptions);
        await File.WriteAllTextAsync(_configPath, json);
    }
}