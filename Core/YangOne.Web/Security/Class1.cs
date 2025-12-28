using Microsoft.AspNetCore.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace YangOne.Web.Security
{
    internal class Class1
    {
    }
    public class FileConfig
    {
        public Dictionary<string, List<string>> AllowFileTypes { get; set; } = new();
    }

    public interface IFileConfigService
    {
        Task<FileConfig> GetConfigAsync();
        Task SaveConfigAsync(FileConfig config);
    }

    public class FileConfigService : IFileConfigService
    {
        private readonly string _configPath;
        private readonly JsonSerializerOptions _jsonOptions;

        public FileConfigService(IWebHostEnvironment env)
        {
            var appData = Path.Combine(env.ContentRootPath, "App_Data");
            if (!Directory.Exists(appData))
            {
                Directory.CreateDirectory(appData);
            }

            _configPath = Path.Combine(appData, "fileconfig.json");

            _jsonOptions = new JsonSerializerOptions
            {
                WriteIndented = true
            };
        }

        public async Task<FileConfig> GetConfigAsync()
        {
            var result = new FileConfig();

            if (!File.Exists(_configPath))
            {
                return result;
            }

            var json = await File.ReadAllTextAsync(_configPath);
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            if (root.TryGetProperty("AllowFileTypes", out var aft) &&
                aft.ValueKind == JsonValueKind.Object)
            {
                foreach (var prop in aft.EnumerateObject())
                {
                    if (prop.Value.ValueKind != JsonValueKind.Array) continue;

                    var list = new List<string>();

                    foreach (var v in prop.Value.EnumerateArray())
                    {
                        var s = v.GetString();
                        if (!string.IsNullOrWhiteSpace(s))
                        {
                            list.Add(s.Trim());
                        }
                    }

                    if (list.Count > 0)
                    {
                        // Keep extension as-is, but trimmed
                        var ext = prop.Name.Trim();
                        if (!string.IsNullOrWhiteSpace(ext))
                        {
                            result.AllowFileTypes[ext] = list;
                        }
                    }
                }
            }

            return result;
        }

        public async Task SaveConfigAsync(FileConfig config)
        {
            var cleanAllow = new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase);

            foreach (var kvp in config.AllowFileTypes)
            {
                var ext = (kvp.Key ?? string.Empty).Trim();
                if (string.IsNullOrWhiteSpace(ext))
                    continue;

                var list = new List<string>();
                foreach (var v in kvp.Value ?? new List<string>())
                {
                    if (!string.IsNullOrWhiteSpace(v))
                    {
                        var trimmed = v.Trim();
                        if (!list.Contains(trimmed, StringComparer.OrdinalIgnoreCase))
                        {
                            list.Add(trimmed);
                        }
                    }
                }

                if (list.Count > 0)
                {
                    cleanAllow[ext] = list;
                }
            }

            var toSerialize = new Dictionary<string, object>
            {
                ["AllowFileTypes"] = cleanAllow
            };

            var json = JsonSerializer.Serialize(toSerialize, _jsonOptions);
            await File.WriteAllTextAsync(_configPath, json);
        }
    }

    public class AppBasicSecurity
    {
        public bool RequireOTP { get; set; }
        public bool RequireDeviceVerification { get; set; }
        public bool SendOTPFromEmail { get; set; }
        public bool SendOTPFromSMS { get; set; }

        public int OTPExpiryTimeInMinutes { get; set; }

        public bool RequireConfirmedEmail { get; set; }

        public int PasswordLength { get; set; }
        public bool RequireNonAlphanumeric { get; set; }
        public bool RequireUppercase { get; set; }
    }

    public interface IAppBasicSecurityService
    {
        Task<AppBasicSecurity> GetConfigAsync();
        Task SaveConfigAsync(AppBasicSecurity config);
    }

    public class AppBasicSecurityService : IAppBasicSecurityService
    {
        private readonly string _configPath;
        private readonly JsonSerializerOptions _jsonOptions;

        public AppBasicSecurityService(IWebHostEnvironment env)
        {
            var appData = Path.Combine(env.ContentRootPath, "App_Data");
            if (!Directory.Exists(appData))
            {
                Directory.CreateDirectory(appData);
            }

            _configPath = Path.Combine(appData, "securityconfig.json");

            _jsonOptions = new JsonSerializerOptions
            {
                WriteIndented = true
            };
        }

        public async Task<AppBasicSecurity> GetConfigAsync()
        {
            if (!File.Exists(_configPath))
            {
                // defaults same as your example
                return new AppBasicSecurity
                {
                    RequireOTP = false,
                    RequireDeviceVerification = false,
                    SendOTPFromEmail = false,
                    SendOTPFromSMS = false,
                    OTPExpiryTimeInMinutes = 5,
                    RequireConfirmedEmail = false,
                    PasswordLength = 8,
                    RequireNonAlphanumeric = false,
                    RequireUppercase = false
                };
            }

            var json = await File.ReadAllTextAsync(_configPath);
            var config = JsonSerializer.Deserialize<AppBasicSecurity>(json, _jsonOptions);

            // Fallback in case deserialize returns null
            return config ?? new AppBasicSecurity
            {
                OTPExpiryTimeInMinutes = 5,
                PasswordLength = 8
            };
        }

        public async Task SaveConfigAsync(AppBasicSecurity config)
        {
            var json = JsonSerializer.Serialize(config, _jsonOptions);
            await File.WriteAllTextAsync(_configPath, json);
        }
    }
}
