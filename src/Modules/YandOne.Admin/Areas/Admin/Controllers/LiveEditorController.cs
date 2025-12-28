using LibSassHost;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Json;
using YangOne.Web;
using YangOne.Web.Theme;

namespace YandOne.Admin.Controllers;

public static class ThemeExtensions
{
    public static string GetThemeNameFromPath(this string path)
    {
        if (string.IsNullOrWhiteSpace(path))
            return null;

        // Normalize path separators (handle both '/' and '\')
        var normalizedPath = path.Replace('\\', '/').Trim('/');

        // Split into segments
        var segments = normalizedPath.Split('/');

        // Find the index of "Themes"
        int themesIndex = Array.FindIndex(segments, s => s.Equals("Themes", StringComparison.OrdinalIgnoreCase));

        if (themesIndex >= 0 && themesIndex + 1 < segments.Length)
        {
            // Return the next segment after "Themes"
            return segments[themesIndex + 1];
        }

        return null; // No theme found
    }
}
[Area("Admin")]
public class LiveEditorController : BaseController
{
    private readonly IWebHostEnvironment _webHostEnvironment;
    private readonly IThemeManager _themeManager;
    private readonly string _themeRoot = "Themes";
    private readonly SassCompilerService _sassCompiler = new();

    public LiveEditorController(IWebHostEnvironment webHostEnvironment, IThemeManager themeManager)
    {
        _webHostEnvironment = webHostEnvironment;
        _themeManager = themeManager;
    }
    [HttpGet("admin/editor")]
    public IActionResult Index()
    {
        return View(); // Loads your editor Razor View
    }

    [HttpGet("admin/editor/files")]
    public IActionResult GetFileTree()
    {
        var tree = BuildTree(new DirectoryInfo(_themeRoot));
        return Json(tree);
    }
    [HttpPost]
    [Route("admin/editor/save/file")]
    public async Task<IActionResult> SaveFile(string filepath, string content)
    {
        try
        {


            if (string.IsNullOrWhiteSpace(content))
                return Json(new { Code = 500, Message = "Empty content" });

            if (IsUnsafeContent(filepath, content))
            {

                return Json(new { Code = 500, Message = "File contains disallowed or unsafe code." });
            }
            var fp = Path.Combine(_webHostEnvironment.ContentRootPath, filepath.Replace("/", Path.DirectorySeparatorChar.ToString()));

            // If it's SCSS, compile and save CSS
            if (fp.EndsWith(".scss", StringComparison.OrdinalIgnoreCase))
            {
                await System.IO.File.WriteAllTextAsync(fp, content);
                //var css = _sassCompiler.Compile(content);
                //var cssOutPath = filePath.Replace("scss", "css").Replace(".scss", ".css");
                //System.IO.File.WriteAllText(cssOutPath, css);
                var themeName = filepath.GetThemeNameFromPath();
               var themeInfo=await _themeManager.GetThemeInfo(themeName);
               //var mainScssContent =
               //    await System.IO.File.ReadAllTextAsync(Path.Combine("Themes", themeName, themeInfo.ScssMainFile));
               var (css, minifiedCss) = _sassCompiler.CompileFile(Path.Combine("Themes", themeName, themeInfo.ScssMainFile));
               System.IO.File.WriteAllText(Path.Combine("Themes", themeName, themeInfo.OutputDir,"theme.css"), css);
               System.IO.File.WriteAllText(Path.Combine("Themes", themeName, themeInfo.OutputDir, "theme.min.css"),
                   minifiedCss);

               //var (css, minifiedCss) = _sassCompiler.Compile(content);

               //var cssOutPath = fp.Replace("scss", "css").Replace(".scss", ".css");
               //var minPath = cssOutPath.Replace(".css", ".min.css");

               //System.IO.File.WriteAllText(cssOutPath, css);
               //System.IO.File.WriteAllText(minPath, minifiedCss);
            }
            else
            {

                System.IO.File.WriteAllText(fp, content);
            }

            TempData["Success"] = "File saved successfully.";
            return Json(new
            {
                Code = 200,
                Message = $"File saved successfully."
            });
        }
        catch (Exception e)
        {
            return Json(new
            {
                Code = 500,
                Message = $"Failed to save file",
                Error=e.ToString()
            });
        }
    }
    private readonly string[] _blockedJsPatterns = new[]
    {
        "<script", "document.cookie", "eval(", "window.location", "localStorage", "sessionStorage"
    };

    private readonly string[] _blockedCssPatterns = new[]
    {
        "expression(", "url(\"javascript:", "url('javascript:", "url(javascript:"
    };

    private bool IsUnsafeContent(string path, string content)
    {
        if (path.EndsWith(".js", StringComparison.OrdinalIgnoreCase))
        {
            return _blockedJsPatterns.Any(p => content.Contains(p, StringComparison.OrdinalIgnoreCase));
        }

        if (path.EndsWith(".css", StringComparison.OrdinalIgnoreCase))
        {
            return _blockedCssPatterns.Any(p => content.Contains(p, StringComparison.OrdinalIgnoreCase));
        }

        return false;
    }
    [HttpGet("admin/editor/load")]
    public IActionResult LoadFile(string path)
    {
        var fullPath = Path.Combine(Directory.GetCurrentDirectory(), path);
        if (!System.IO.File.Exists(fullPath))
            return NotFound();
        var content = System.IO.File.ReadAllText(fullPath);
        return Content(content);
    }

    [HttpPost("admin/editor/save")]
    public IActionResult SaveFile([FromBody] FileSaveModel model)
    {
        var fullPath = Path.Combine(Directory.GetCurrentDirectory(), model.Path);
        System.IO.File.WriteAllText(fullPath, model.Content);
        return Ok();
    }

    private object BuildTree(DirectoryInfo dir)
    {
        return new
        {
            name = dir.Name,
            path = dir.FullName.Substring(Directory.GetCurrentDirectory().Length + 1).Replace("\\", "/"),
            children = dir.EnumerateFileSystemInfos()
                .Select(f => f is DirectoryInfo d ? BuildTree(d) : new
                {
                    name = f.Name,
                    path = f.FullName.Substring(Directory.GetCurrentDirectory().Length + 1).Replace("\\", "/"),
                    isFile = true
                }).ToList()
        };
    }

    public class FileSaveModel
    {
        public string Path { get; set; }
        public string Content { get; set; }
    }
}