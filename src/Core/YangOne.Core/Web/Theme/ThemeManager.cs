using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.IO.Compression;
using YangOne.Configuration;
using YangOne.Extensions;
using YangOne.IO;
using YangOne.Log;
using YangOne.Storage;

namespace YangOne.Web.Theme
{
    public class ThemeManager : IThemeManager
    {
        private readonly IConfigToJson _configToJson;
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly IThemeConfig _themeConfig;
        private readonly IStorageProvider _storageProvider;
        private readonly ILogger _logger;
        private readonly IKeyGenerator _keyGenerator;
        private readonly IFileOptions _fileOptions;
        private readonly YangOneAppConfig _kachuwaAppConfig;
        private const string ThemeConfigFile = "themeconfig.json";
        public ThemeManager(IConfigToJson configToJson,
            IOptionsSnapshot<YangOneAppConfig> appConfig
            , IWebHostEnvironment hostingEnvironment, IThemeConfig themeConfig,
            IStorageProvider storageProvider, ILogger logger,
            IKeyGenerator keyGenerator, IFileOptions fileOptions)
        {
            _configToJson = configToJson;
            _hostingEnvironment = hostingEnvironment;
            _themeConfig = themeConfig;
            _storageProvider = storageProvider;
            _logger = logger;
            _keyGenerator = keyGenerator;
            _fileOptions = fileOptions;
            _kachuwaAppConfig = appConfig.Value;
        }
        public async Task<bool> Install(ThemeInfo theme)
        {
            return true;
        }

        public async Task<bool> Uninstall(ThemeInfo theme)
        {
            return true;
        }

        public Task<bool> SetDefault(ThemeInfo theme)
        {
            if (theme == null)
                throw new Exception("Invalid Theme");
            _kachuwaAppConfig.Theme = theme.ThemeName.Trim();
            return Task.FromResult(_configToJson.SaveKachuwaConfig(_kachuwaAppConfig));
        }
        public async Task<ThemeInfo> GetThemeInfo(string themeName)
        {
            string themesDirectory = Path.Combine(_hostingEnvironment.ContentRootPath, _themeConfig.Directory);
           
                string themeConfigFile = Path.Combine(themesDirectory, themeName, ThemeConfigFile);
                if (File.Exists(themeConfigFile))
                {
                    string themeconfigJson = await File.ReadAllTextAsync(themeConfigFile);
                    var themeInfo = JsonConvert.DeserializeObject<ThemeInfo>(themeconfigJson);
                    return themeInfo;
                }

                return null;


        }
        public async Task<IEnumerable<ThemeInfo>> GetThemes(string query, int page, int limit)
        {

            string themesDirectory = Path.Combine(_hostingEnvironment.ContentRootPath, _themeConfig.Directory);
            string[] themes = Directory.GetDirectories(themesDirectory, "*", SearchOption.TopDirectoryOnly)
                .ToArray();
            var themeInfos = new List<ThemeInfo>();
            foreach (var theme in themes)
            {
                string themeConfigFile = Path.Combine(theme, ThemeConfigFile);
                if (File.Exists(themeConfigFile))
                {
                    string themeconfigJson = await File.ReadAllTextAsync(themeConfigFile);
                    var themeInfo = JsonConvert.DeserializeObject<ThemeInfo>(themeconfigJson);
                    themeInfos.Add(themeInfo);
                }
            }

            return themeInfos.Where(x => x.ThemeName.Contains(query) || string.IsNullOrEmpty(query)).Page(limit, page);
        }

        public async Task<ThemeStatus> UnzipAndInstall(IFormFile themeZip)
        {
            try
            {
                var temfolder = _storageProvider.GetTempRelativePath();

                string path = await _storageProvider.Save(temfolder, themeZip);
                var targetPath = Path.Combine(_hostingEnvironment.WebRootPath, _fileOptions.Path, temfolder);
                var source = Path.Combine(_hostingEnvironment.ContentRootPath, "Themes");
                if (path.StartsWith("/"))
                {
                    path = path.TrimStart('/');
                }

                path = path.Replace("/", "\\");
                var physicalPath = Path.Combine(_hostingEnvironment.WebRootPath, path);
                ZipFile.ExtractToDirectory(physicalPath, targetPath);
                var themeDirectory = Path.Combine(_hostingEnvironment.ContentRootPath, "Themes");
                FileHelper.CopyDirectoryOnly(targetPath, themeDirectory);
                System.IO.Directory.Delete(targetPath, true);

                //TODO check theme config and validation 

                return new ThemeStatus
                {
                    IsInstalled = true
                };
            }
            catch (Exception e)
            {
                return new ThemeStatus
                {
                    IsInstalled = false,
                    HasError = true,
                    Error = e.Message
                };
            }

        }
    }
}