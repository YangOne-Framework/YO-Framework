using Microsoft.AspNetCore.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Threading.Tasks;
using YangOne.Security;

namespace YangOne.Web.Security
{
    public interface ICSPManager
    {
        string[] KnownDirectives { get; set; }
        Task<CspConfig> GetConfigAsync();
        Task SaveConfigAsync(CspConfig config);
    }
    public  class CSPManager: ICSPManager
    {
        private readonly string _configPath;
        private readonly JsonSerializerOptions _jsonOptions;

        // Known directives you want to manage in the UI
        public string[] KnownDirectives { get; set; }=
        new[]
        {
        "default-src",
        "script-src",
        "style-src",
        "img-src",
        "object-src",
        "media-src",
        "connect-src",
        "form-action",
        "frame-src",
        "embed-src",
        "font-src",
        "base-uri"
    };

        public CSPManager(IWebHostEnvironment env)
        {
            var appData = Path.Combine(env.ContentRootPath, "App_Data");
            if (!Directory.Exists(appData))
            {
                Directory.CreateDirectory(appData);
            }

            _configPath = Path.Combine(appData, "cspconfig.json");

            _jsonOptions = new JsonSerializerOptions
            {
                WriteIndented = true,
                // This prevents single quotes from being turned into \u0027
                Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            };
        }

        public async Task<CspConfig> GetConfigAsync()
        {
            var config = new CspConfig();

            if (!File.Exists(_configPath))
            {
                // Default values if file does not exist yet
                config.Directives["default-src"] = new List<string> { "'self'" };
                config.Directives["script-src"] = new List<string> { "'self'" };
                config.Directives["style-src"] = new List<string> { "'self'" };
                config.Directives["img-src"] = new List<string> { "'self'" };
                config.Directives["object-src"] = new List<string> { "'none'" };
                config.Directives["media-src"] = new List<string> { "'none'" };
                config.Directives["connect-src"] = new List<string> { "'self'" };
                config.Directives["form-action"] = new List<string> { "'self'" };
                config.Directives["frame-src"] = new List<string> { "'self'" };
                config.Directives["embed-src"] = new List<string> { "'self'" };
                config.Directives["font-src"] = new List<string> { "'self'" };
                config.Directives["base-uri"] = new List<string> { "'self'" };

                config.SupportNonce = true;
                return config;
            }

            var json = await File.ReadAllTextAsync(_configPath);
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            foreach (var prop in root.EnumerateObject())
            {
                var nameTrimmed = prop.Name.Trim();

                // Handle SupportNonce (with or without extra space)
                if (string.Equals(nameTrimmed, "SupportNonce", StringComparison.OrdinalIgnoreCase))
                {
                    if (prop.Value.ValueKind == JsonValueKind.True ||
                        prop.Value.ValueKind == JsonValueKind.False)
                    {
                        config.SupportNonce = prop.Value.GetBoolean();
                    }
                    continue;
                }

                // Directives
                if (prop.Value.ValueKind == JsonValueKind.Array)
                {
                    var list = new List<string>();

                    foreach (var v in prop.Value.EnumerateArray())
                    {
                        var value = v.GetString();
                        if (!string.IsNullOrWhiteSpace(value))
                        {
                            list.Add(value.Trim());
                        }
                    }

                    if (list.Count > 0)
                    {
                        config.Directives[prop.Name] = list;
                    }
                }
            }

            // Ensure all known directives exist
            foreach (var dir in KnownDirectives)
            {
                if (!config.Directives.ContainsKey(dir))
                {
                    // Minimal sensible default
                    if (dir == "object-src" || dir == "media-src")
                    {
                        config.Directives[dir] = new List<string> { "'none'" };
                    }
                    else
                    {
                        config.Directives[dir] = new List<string> { "'self'" };
                    }
                }
            }

            return config;
        }

        public async Task SaveConfigAsync(CspConfig config)
        {
            var toSerialize = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);

            foreach (var kvp in config.Directives)
            {
                var nonEmpty = kvp.Value
                    .Where(v => !string.IsNullOrWhiteSpace(v))
                    .Select(v => v.Trim())
                    .Distinct(StringComparer.Ordinal)
                    .ToList();

                // Always ensure at least one value per directive
                if (nonEmpty.Count == 0)
                {
                    // If no values, use 'self' as a fallback except for *-src that are usually 'none'
                    if (kvp.Key.Equals("object-src", StringComparison.OrdinalIgnoreCase) ||
                        kvp.Key.Equals("media-src", StringComparison.OrdinalIgnoreCase))
                    {
                        nonEmpty.Add("'none'");
                    }
                    else
                    {
                        nonEmpty.Add("'self'");
                    }
                }

                toSerialize[kvp.Key] = nonEmpty;
            }

            // Write SupportNonce as a clean property
            toSerialize["SupportNonce"] = config.SupportNonce;

            var json = JsonSerializer.Serialize(toSerialize, _jsonOptions);
            await File.WriteAllTextAsync(_configPath, json);
        }
    }
}
