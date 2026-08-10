using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using YangOne.Web;

namespace YangOne.YOTheme.Cli;

public static class CliRunner
{
    public static async Task<int> RunAsync(string[] args, TextWriter stdout, TextWriter stderr)
    {
        if (args.Length == 0)
            return Usage(stderr, "A command is required.");

        try
        {
            return args[0].ToLowerInvariant() switch
            {
                "validate" => await ValidateAsync(args, stdout, stderr),
                "compile" => await CompileAsync(args, stdout, stderr),
                "verify" => await VerifyAsync(args, stdout, stderr),
                "format" => await FormatAsync(args, stdout, stderr),
                "help" or "--help" or "-h" => Usage(stdout, null),
                _ => Usage(stderr, $"Unknown command: {args[0]}")
            };
        }
        catch (JsonException ex)
        {
            await stderr.WriteLineAsync($"Invalid JSON: {ex.Message}");
            return 3;
        }
        catch (IOException ex)
        {
            await stderr.WriteLineAsync($"File error: {ex.Message}");
            return 3;
        }
        catch (Exception ex)
        {
            await stderr.WriteLineAsync($"Unexpected error: {ex.Message}");
            return 4;
        }
    }

    private static async Task<int> ValidateAsync(string[] args, TextWriter stdout, TextWriter stderr)
    {
        var input = Input(args, stderr);
        if (input == null) return 2;
        var config = await ReadConfigAsync(input);
        var result = YOThemeCompiler.Compile(config);
        foreach (var item in result.Validation)
            await stdout.WriteLineAsync($"{item.Severity}: {item.Type}: {item.Message}{(string.IsNullOrWhiteSpace(item.PropertyPath) ? "" : $" [{item.PropertyPath}]")}");
        return result.Success ? 0 : 1;
    }

    private static async Task<int> CompileAsync(string[] args, TextWriter stdout, TextWriter stderr)
    {
        var input = Input(args, stderr);
        if (input == null) return 2;
        var output = Option(args, "--output");
        var result = YOThemeCompiler.Compile(await ReadConfigAsync(input));
        if (!result.Success)
        {
            foreach (var item in result.Validation.Where(v => v.Severity == "error"))
                await stderr.WriteLineAsync($"error: {item.Message}");
            return 1;
        }
        if (output == null)
            await stdout.WriteAsync(result.Css ?? string.Empty);
        else
            await File.WriteAllTextAsync(output, result.Css ?? string.Empty, Encoding.UTF8);
        return 0;
    }

    private static async Task<int> VerifyAsync(string[] args, TextWriter stdout, TextWriter stderr)
    {
        var input = Input(args, stderr);
        if (input == null) return 2;
        var root = JsonNode.Parse(await File.ReadAllTextAsync(input))?.AsObject();
        if (root == null || root["signature"]?["hash"] == null)
        {
            await stderr.WriteLineAsync("Package signature is missing.");
            return 1;
        }
        var signature = root["signature"]!["hash"]!.GetValue<string>();
        root.Remove("signature");
        var canonical = root.ToJsonString(new JsonSerializerOptions { WriteIndented = false });
        var computed = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(canonical))).ToLowerInvariant();
        await stdout.WriteLineAsync($"algorithm: sha256");
        await stdout.WriteLineAsync($"expected: {signature}");
        await stdout.WriteLineAsync($"computed: {computed}");
        return string.Equals(signature, computed, StringComparison.OrdinalIgnoreCase) ? 0 : 1;
    }

    private static async Task<int> FormatAsync(string[] args, TextWriter stdout, TextWriter stderr)
    {
        var input = Input(args, stderr);
        if (input == null) return 2;
        var output = Option(args, "--output");
        var node = JsonNode.Parse(await File.ReadAllTextAsync(input));
        var formatted = node?.ToJsonString(new JsonSerializerOptions { WriteIndented = true }) ?? "{}";
        if (output == null)
            await stdout.WriteLineAsync(formatted);
        else
            await File.WriteAllTextAsync(output, formatted + Environment.NewLine, Encoding.UTF8);
        return 0;
    }

    private static async Task<string> ReadConfigAsync(string path)
    {
        var root = JsonNode.Parse(await File.ReadAllTextAsync(path));
        if (root is JsonObject package && package["config"] is not null)
        {
            var config = package["config"];
            return config is JsonValue value && value.TryGetValue<string>(out var text)
                ? text
                : config!.ToJsonString(new JsonSerializerOptions { WriteIndented = false });
        }
        return root?.ToJsonString(new JsonSerializerOptions { WriteIndented = false }) ?? "{}";
    }

    private static string? Input(string[] args, TextWriter stderr)
    {
        if (args.Length < 2 || args[1].StartsWith("-"))
        {
            stderr.WriteLine("An input theme/package file is required.");
            return null;
        }
        return File.Exists(args[1]) ? args[1] : throw new FileNotFoundException("Input file not found", args[1]);
    }

    private static string? Option(string[] args, string name)
    {
        var index = Array.IndexOf(args, name);
        return index >= 0 && index + 1 < args.Length ? args[index + 1] : null;
    }

    private static int Usage(TextWriter output, string? error)
    {
        if (error != null) output.WriteLine($"Error: {error}");
        output.WriteLine("yo-theme validate <file>");
        output.WriteLine("yo-theme compile <file> [--output <css-file>]");
        output.WriteLine("yo-theme verify <package-file>");
        output.WriteLine("yo-theme format <file> [--output <json-file>]");
        return error == null ? 0 : 2;
    }
}

public static class Program
{
    public static Task<int> Main(string[] args) => CliRunner.RunAsync(args, Console.Out, Console.Error);
}
