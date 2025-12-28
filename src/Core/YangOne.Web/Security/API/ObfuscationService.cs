using System.Text;

namespace YangOne.Web.Security.API;

public class ObfuscationService
{
    private readonly string _prefix;

    public ObfuscationService(string prefix = ")]}'\n")
    {
        _prefix = prefix;
    }

    public string Obfuscate(string data)
    {
        var bytes = Encoding.UTF8.GetBytes(data);
        return _prefix + Convert.ToBase64String(bytes);
    }

    public string Deobfuscate(string obfuscated)
    {
        if (string.IsNullOrEmpty(obfuscated))
            return obfuscated;

        if (obfuscated.StartsWith(_prefix))
        {
            obfuscated = obfuscated.Substring(_prefix.Length);
        }

        try
        {
            var bytes = Convert.FromBase64String(obfuscated);
            return Encoding.UTF8.GetString(bytes);
        }
        catch (FormatException)
        {
            // If it's not base64, return original (maybe it wasn't obfuscated)
            return obfuscated;
        }
    }
}