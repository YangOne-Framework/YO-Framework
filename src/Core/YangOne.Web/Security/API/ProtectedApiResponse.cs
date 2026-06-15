using System.Text.Json;

namespace YangOne.Web.Security.API;

public class ProtectedApiResponse
{
    public bool ProtectedPayload { get; set; }
    public string Mode { get; set; } = "None";
    public string Payload { get; set; } = "";
}

public interface IApiPayloadSecurityService
{
    Task<ProtectedApiResponse> WrapPayload(object apiResponse);
}

public class ApiPayloadSecurityService : IApiPayloadSecurityService
{
    private readonly IApiConfigService _configService;
    private static readonly ObfuscationService _obfuscationService = new();

    public ApiPayloadSecurityService(IApiConfigService configService)
    {
        _configService = configService;
    }

    public async Task<ProtectedApiResponse> WrapPayload(object apiResponse)
    {
        var config = await _configService.GetConfigAsync();

        var json = JsonSerializer.Serialize(apiResponse);

        if (config.UseEncryption && !string.IsNullOrEmpty(config.EncryptionKey))
        {
            var encryptionService = new EncryptionService(config.EncryptionKey, config.EncryptionIV ?? "");
            return new ProtectedApiResponse
            {
                ProtectedPayload = true,
                Mode = "Encryption",
                Payload = encryptionService.Encrypt(json)
            };
        }

        if (config.UseObfusication)
        {
            return new ProtectedApiResponse
            {
                ProtectedPayload = true,
                Mode = "Obfuscation",
                Payload = _obfuscationService.Obfuscate(json)
            };
        }

        return new ProtectedApiResponse
        {
            ProtectedPayload = false,
            Mode = "None",
            Payload = json
        };
    }
}