using System.Text.Json;

namespace YangOne.Security;

public static class CspConfigLoader
{
    public static CspConfig Load(string filePath)
    {
        var json = File.ReadAllText(filePath);
        var dict = JsonSerializer.Deserialize<Dictionary<string, object>>(json);

        var config = new CspConfig();
        foreach (var kvp in dict)
        {
            if (kvp.Key == "supportnonce")
            {
                config.SupportNonce = Convert.ToBoolean(kvp.Value);
            }
            else
            {
                // Convert JSON arrays to List<string>
                var arr = kvp.Value as JsonElement?;
                if (arr.HasValue && arr.Value.ValueKind == JsonValueKind.Array)
                {
                    var list = new List<string>();
                    foreach (var item in arr.Value.EnumerateArray())
                        list.Add(item.GetString());
                    config.Directives[kvp.Key] = list;
                }
            }
        }
        return config;
    }
}
