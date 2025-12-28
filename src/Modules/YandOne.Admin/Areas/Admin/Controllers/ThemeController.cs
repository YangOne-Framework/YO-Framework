using System.IO.Compression;
using DartSassHost;
using JavaScriptEngineSwitcher.ChakraCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using NUglify;
using YangOne.Configuration;
using YangOne.Data.Crud.Attribute;
using YangOne.Installer;
using YangOne.Localization;
using YangOne.Web;
using YangOne.Web.Notification;
using YangOne.Web.Security;
using YangOne.Web.Theme;

namespace YandOne.Admin.Controllers
{
    public class SassCompilerService
    {
        //public string Compile(string sass)
        //{
        //    try
        //    {
        //        CompilationResult result = SassCompiler.Compile(sass);
        //        return result.CompiledContent;
        //    }
        //    catch (Exception ex)
        //    {
        //        return $"/* ⚠️ SCSS Error: {ex.Message} */";
        //    }
        //}
        //public (string compiledCss, string minifiedCss) Compile(string sass)
        //{
        //    try
        //    {
        //        var result = SassCompiler.Compile(sass,true);
        //        var css = result.CompiledContent;

        //        var minifyResult = Uglify.Css(css);
        //        var minified = minifyResult.HasErrors ? "/* ⚠ Minification failed */" : minifyResult.Code;

        //        return (css, minified);
        //    }
        //    catch (Exception ex)
        //    {
        //        return ($"/* ⚠️ SCSS Error: {ex.Message} */", "");
        //    }
        //}
        public (string compiledCss, string minifiedCss) CompileFile(string sassFile)
        {
            try
            {
                var options = new CompilationOptions { SourceMap = true };
                using (var sassCompiler = new SassCompiler(new ChakraCoreJsEngineFactory(), options))
                {
                    CompilationResult result = sassCompiler.CompileFile(sassFile,null,null, options);

                    Console.WriteLine("Compiled content:{1}{1}{0}{1}", result.CompiledContent,
                        Environment.NewLine);
                    Console.WriteLine("Source map:{1}{1}{0}{1}", result.SourceMap, Environment.NewLine);
                    Console.WriteLine("Included file paths: {0}",
                        string.Join(", ", result.IncludedFilePaths));
                    var minifyResult = Uglify.Css(result.CompiledContent);
                    var minified = minifyResult.HasErrors ? "/*Minification failed */" : minifyResult.Code;

                    return (result.CompiledContent, minified);
                }
                //var result = SassCompiler.CompileFile(sass);
                //var css = result.CompiledContent;

                //var minifyResult = Uglify.Css(css);
                //var minified = minifyResult.HasErrors ? "/* ⚠ Minification failed */" : minifyResult.Code;

                //return (css, minified);
            }
            catch (Exception ex)
            {
                return ($"/* ⚠️ SCSS Error: {ex.Message} */", "");
            }
        }
    }
    [Area("Admin")]
    [Authorize(PolicyConstants.PagePermission)]
    public class ThemeController : BaseController
    {
        private readonly IThemeManager _themeManager;
        private readonly INotificationService _notificationService;
        private readonly ILocaleResourceProvider _localeResourceProvider;
        private readonly IYangOneConfigurationManager _yoConfigMgr;
        private readonly YangOneAppConfig _yoAppConfig;
        private readonly string _themeRoot = "Themes";
        private readonly SassCompilerService _sassCompiler = new();
        public ThemeController(IThemeManager themeManager, INotificationService notificationService, ILocaleResourceProvider localeResourceProvider,
            IOptionsSnapshot<YangOneAppConfig> optionsSnapshot)
        {
            _themeManager = themeManager;
            _notificationService = notificationService;
            _localeResourceProvider = localeResourceProvider;

            _localeResourceProvider.LookUpGroupAt("Themes");
            _yoAppConfig = optionsSnapshot.Value;
        }
        [Route("admin/theme/manage/page/{pageNo}")]
        [Route("admin/theme/manage")]
        [Route("admin/theme")]
        [FriendlyName("Manage Theme List")]
        public async Task<IActionResult> Index([FromQuery]string query = "", [FromRoute]int pageNo = 1, int limit = 10)
        {
            ViewData["Page"] = pageNo;
            ViewData["Config"] = _yoAppConfig;
            var themes = await _themeManager.GetThemes(query, pageNo - 1, limit);

            return View(themes);
        }
        [HttpPost]
        [Route("admin/theme/change")]
        [FriendlyName("Change Default Theme")]
        public async Task<JsonResult> ChangeDefaultTheme(ThemeInfo theme)
        {
            var status = await _themeManager.SetDefault(theme);
            _notificationService.Notify(_localeResourceProvider.Get("Success"),
                _localeResourceProvider.Get("Theme.ChangedSuccessfully"), NotificationType.Success);
            return Json(new { Code = 200, Data = status });
        }

    
        public async Task<ActionResult> New()
        {
            return View();
        }

        [HttpPost]
        public async Task<ActionResult> New(ThemeViewModel model)
        {
            if (ModelState.IsValid)
            {
                if (model.ThemeZip != null)
                {
                    var status = await _themeManager.UnzipAndInstall(model.ThemeZip);
                    if (status.IsInstalled)
                    {
                        _notificationService.Notify(_localeResourceProvider.Get("Success"),
                            _localeResourceProvider.Get("Theme.InstallMessage"), NotificationType.Success);
                        _notificationService.Notify(_localeResourceProvider.Get("Info"),
                            _localeResourceProvider.Get("Theme.ConfiguringMessage"), NotificationType.Info);

                        return RedirectToAction("Index");
                    }
                    else
                    {
                        _notificationService.Notify(_localeResourceProvider.Get("Error"),
                            status.Error, NotificationType.Error);
                    }
                }
                else
                {
                    _notificationService.Notify(_localeResourceProvider.Get("Alert"),
                        _localeResourceProvider.Get("Theme.UploadZipFileFirst"),
                        NotificationType.Warning);
                    ModelState.AddModelError("Theme", "Please upload file first.");
                }
                return View();
            }

            return View();
        }

        [Route("admin/theme/editor")]
        public IActionResult Editor(string theme)
        {
            ViewBag.ThemeName = theme;
            return View();
        }
        [Route("admin/theme/preview")]
        public IActionResult Preview(string theme)
        {
            ViewBag.ThemeName = theme;
            return View();
        }

        [HttpPost]
        [Route("admin/theme/uploadassest")]
        public IActionResult UploadAsset(string theme, IFormFile file, string folder)
        {
            var path = Path.Combine(_themeRoot, theme, "Assets", folder, file.FileName);
            using var stream = new FileStream(path, FileMode.Create);
            file.CopyTo(stream);
            return RedirectToAction("Editor", new { theme });
        }
        [Route("admin/theme/export")]
        public IActionResult Export(string theme)
        {
            var themePath = Path.Combine(_themeRoot, theme);
            var zipPath = Path.Combine("wwwroot/uploads", theme + ".zip");
            if (System.IO.File.Exists(zipPath))
                System.IO.File.Delete(zipPath);
            ZipFile.CreateFromDirectory(themePath, zipPath);
            return File(System.IO.File.ReadAllBytes(zipPath), "application/zip", theme + ".zip");
        }
        [HttpGet]
        [Route("admin/theme/loadfile")]
        public IActionResult LoadFile(string theme, string path)
        {
            var filePath = Path.Combine(_themeRoot, theme, path.Replace("/", Path.DirectorySeparatorChar.ToString()));
            if (!System.IO.File.Exists(filePath)) return NotFound();
            return Content(System.IO.File.ReadAllText(filePath));
        }
 
        [HttpPost]
        [Route("admin/theme/savefile")]
        public IActionResult SaveFile(string theme, string path, string content)
        {
            if (string.IsNullOrWhiteSpace(content)) return BadRequest("Content is empty.");

            if (IsUnsafeContent(path, content))
            {
                TempData["Error"] = "File contains disallowed or unsafe code.";
                return RedirectToAction("Editor", new { theme });
            }
            var filePath = Path.Combine(_themeRoot, theme, path.Replace("/", Path.DirectorySeparatorChar.ToString()));

            // If it's SCSS, compile and save CSS
            if (path.EndsWith(".scss", StringComparison.OrdinalIgnoreCase))
            {
                ////var css = _sassCompiler.Compile(content);
                ////var cssOutPath = filePath.Replace("scss", "css").Replace(".scss", ".css");
                ////System.IO.File.WriteAllText(cssOutPath, css);
                //var (css, minifiedCss) = _sassCompiler.Compile(content);

                //var cssOutPath = filePath.Replace("scss", "css").Replace(".scss", ".css");
                //var minPath = cssOutPath.Replace(".css", ".min.css");

                //System.IO.File.WriteAllText(cssOutPath, css);
                //System.IO.File.WriteAllText(minPath, minifiedCss);
            }

            TempData["Success"] = $"✅ Saved {path}";
            System.IO.File.WriteAllText(filePath, content);
            TempData["Success"] = "File saved successfully.";
            return RedirectToAction("Editor", new { theme });
        }
        [Route("admin/theme/livepreview")]
        public IActionResult LivePreview(string theme)
        {
            ViewBag.ThemeName = theme;
            return View();
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

        [HttpGet]
        [Route("admin/theme/themefiletree")]
        public IActionResult ThemeFileTree(string theme)
        {
            var basePath = Path.Combine(_themeRoot, theme);
            var tree = BuildTree(basePath, basePath);
            return Json(tree);
        }

        private List<object> BuildTree(string root, string baseRoot)
        {
            var nodes = new List<object>();

            foreach (var dir in Directory.GetDirectories(root))
            {
                nodes.Add(new
                {
                    name = Path.GetFileName(dir),
                    path = dir.Replace(baseRoot + Path.DirectorySeparatorChar, "").Replace("\\", "/"),
                    isDir = true,
                    children = BuildTree(dir, baseRoot)
                });
            }

            foreach (var file in Directory.GetFiles(root))
            {
                nodes.Add(new
                {
                    name = Path.GetFileName(file),
                    path = file.Replace(baseRoot + Path.DirectorySeparatorChar, "").Replace("\\", "/"),
                    isDir = false
                });
            }

            return nodes;
        }

    }
}