using System.Data.Common;
using Dapper;
using Newtonsoft.Json;
using YangOne.Data;

namespace YangOne.Web;

public class YOThemeService : IYOThemeService
{
    public CrudService<YOTheme> CrudService { get; set; } = new CrudService<YOTheme>();

    public async Task<YOThemeResult> SaveAsync(YOThemeSaveRequest request)
    {
        try
        {
            var guid = string.IsNullOrEmpty(request.YOThemeUniqueId)
                ? Guid.NewGuid().ToString()
                : request.YOThemeUniqueId;

            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();

                var result = await db.QueryFirstAsync(
                    "usp_YOTheme_Save",
                    new
                    {
                        YOThemeUniqueId = guid,
                        request.Name,
                        request.Slug,
                        Version = request.Version ?? "1.0.0",
                        request.Author,
                        request.Description,
                        request.Tags,
                        Screenshot = (string)null,
                        request.Config,
                        IsSystem = request.IsSystem,
                        ParentYOThemeId = request.ParentYOThemeId,
                        PackagePath = (string)null,
                        PackageHash = (string)null,
                        UpdatedBy = 0
                    },
                    commandType: System.Data.CommandType.StoredProcedure);

                var theme = await GetAsync(guid);

                return new YOThemeResult
                {
                    Success = true,
                    Message = result.Action == "inserted" ? "Theme created" : "Theme updated",
                    Data = theme.Data,
                    Action = result.Action
                };
            }
        }
        catch (Exception ex)
        {
            return new YOThemeResult { Success = false, Message = ex.Message };
        }
    }

    public async Task<YOThemeResult> GetAsync(string yOThemeGUID = null, long? yOThemeId = null)
    {
        try
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();

                var data = await db.QueryFirstOrDefaultAsync<YOTheme>(
                    "usp_YOTheme_Get",
                    new { YOThemeUniqueId = yOThemeGUID, YOThemeId = yOThemeId },
                    commandType: System.Data.CommandType.StoredProcedure);

                return new YOThemeResult
                {
                    Success = data != null,
                    Message = data != null ? "Success" : "Theme not found",
                    Data = data
                };
            }
        }
        catch (Exception ex)
        {
            return new YOThemeResult { Success = false, Message = ex.Message };
        }
    }

    public async Task<YOThemeResult> GetActiveAsync()
    {
        try
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();

                var data = await db.QueryFirstOrDefaultAsync<YOTheme>(
                    "usp_YOTheme_GetActive",
                    commandType: System.Data.CommandType.StoredProcedure);

                return new YOThemeResult
                {
                    Success = data != null,
                    Message = data != null ? "Success" : "No active theme found",
                    Data = data
                };
            }
        }
        catch (Exception ex)
        {
            return new YOThemeResult { Success = false, Message = ex.Message };
        }
    }

    public async Task<YOThemeResult> ListAsync(int offset = 1, int limit = 20, string search = "", string status = "all")
    {
        try
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();

                var data = (await db.QueryAsync<YOThemeListItem>(
                    "usp_YOTheme_List",
                    new { Offset = offset, Limit = limit, Search = search ?? "", Status = status ?? "all" },
                    commandType: System.Data.CommandType.StoredProcedure)).AsList();

                var rowTotal = data.FirstOrDefault()?.RowTotal ?? 0;

                return new YOThemeResult
                {
                    Success = true,
                    Message = "Success",
                    DataList = data,
                    RowTotal = (int)rowTotal
                };
            }
        }
        catch (Exception ex)
        {
            return new YOThemeResult { Success = false, Message = ex.Message };
        }
    }

    public async Task<YOThemeResult> DeleteAsync(string yOThemeGUID, bool cascadeLayouts = false)
    {
        try
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();

                var result = await db.QueryFirstAsync(
                    "usp_YOTheme_Delete",
                    new { YOThemeUniqueId = yOThemeGUID, CascadeLayouts = cascadeLayouts, DeletedBy = 0 },
                    commandType: System.Data.CommandType.StoredProcedure);

                if (result.Action == "not_found")
                    return new YOThemeResult { Success = false, Message = "Theme not found" };

                if (result.Action == "cannot_delete_system")
                    return new YOThemeResult { Success = false, Message = "Cannot delete system theme" };

                return new YOThemeResult
                {
                    Success = true,
                    Message = "Theme deleted",
                    Action = "deleted"
                };
            }
        }
        catch (Exception ex)
        {
            return new YOThemeResult { Success = false, Message = ex.Message };
        }
    }

    public async Task<YOThemeResult> ActivateAsync(string yOThemeGUID)
    {
        try
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();

                var result = await db.QueryFirstAsync(
                    "usp_YOTheme_Activate",
                    new { YOThemeUniqueId = yOThemeGUID },
                    commandType: System.Data.CommandType.StoredProcedure);

                if (result.Action == "not_found")
                    return new YOThemeResult { Success = false, Message = "Theme not found" };

                return new YOThemeResult
                {
                    Success = true,
                    Message = "Theme activated",
                    Action = "activated"
                };
            }
        }
        catch (Exception ex)
        {
            return new YOThemeResult { Success = false, Message = ex.Message };
        }
    }

    public async Task<YOThemeOverrideResult> SaveOverridesAsync(string yOThemeGUID, Dictionary<string, object> overrides)
    {
        try
        {
            // Resolve theme ID from GUID
            var themeResult = await GetAsync(yOThemeGUID);
            if (!themeResult.Success || themeResult.Data == null)
                return new YOThemeOverrideResult { Success = false, Message = "Theme not found" };

            var theme = themeResult.Data as YOTheme;
            if (theme == null)
                return new YOThemeOverrideResult { Success = false, Message = "Theme not found" };

            var themeId = theme.YOThemeId;

            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();

                foreach (var kvp in overrides)
                {
                    await db.ExecuteAsync(
                        "usp_YOTheme_SaveOverride",
                        new
                        {
                            YOThemeId = themeId,
                            KeyPath = kvp.Key,
                            Value = JsonConvert.SerializeObject(kvp.Value),
                            AddedBy = 0
                        },
                        commandType: System.Data.CommandType.StoredProcedure);
                }

                return new YOThemeOverrideResult
                {
                    Success = true,
                    Message = $"{overrides.Count} override(s) saved"
                };
            }
        }
        catch (Exception ex)
        {
            return new YOThemeOverrideResult { Success = false, Message = ex.Message };
        }
    }

    public async Task<YOThemeOverrideResult> GetOverridesAsync(long yOThemeId)
    {
        try
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();

                var data = (await db.QueryAsync<YOThemeOverride>(
                    "usp_YOTheme_GetOverrides",
                    new { YOThemeId = yOThemeId },
                    commandType: System.Data.CommandType.StoredProcedure)).AsList();

                return new YOThemeOverrideResult
                {
                    Success = true,
                    Message = "Success",
                    Data = data
                };
            }
        }
        catch (Exception ex)
        {
            return new YOThemeOverrideResult { Success = false, Message = ex.Message };
        }
    }

    public async Task<YOThemeOverrideResult> ClearOverridesAsync(long yOThemeId)
    {
        try
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();

                await db.ExecuteAsync(
                    "usp_YOTheme_ClearOverrides",
                    new { YOThemeId = yOThemeId },
                    commandType: System.Data.CommandType.StoredProcedure);

                return new YOThemeOverrideResult
                {
                    Success = true,
                    Message = "Overrides cleared"
                };
            }
        }
        catch (Exception ex)
        {
            return new YOThemeOverrideResult { Success = false, Message = ex.Message };
        }
    }

    public async Task<YOThemeResult> ExportThemeJsonAsync(string yOThemeGUID)
    {
        try
        {
            var themeResult = await GetAsync(yOThemeGUID);
            if (!themeResult.Success || themeResult.Data == null)
                return new YOThemeResult { Success = false, Message = "Theme not found" };

            var theme = themeResult.Data as YOTheme;
            if (theme == null)
                return new YOThemeResult { Success = false, Message = "Theme not found" };

            var config = theme.Config != null ? JsonConvert.DeserializeObject(theme.Config) : null;

            var pkg = new YOThemePackage
            {
                manifestVersion = "1.0",
                exportedAt = DateTime.UtcNow.ToString("o"),
                signature = new YOThemePackageSignature
                {
                    hash = "",
                    hashAlgorithm = "sha256"
                },
                meta = new YOThemePackageMeta
                {
                    name = theme.Name,
                    slug = theme.Slug,
                    version = theme.Version,
                    author = theme.Author,
                    description = theme.Description,
                    tags = theme.Tags
                },
                config = theme.Config ?? "{}",
                assets = new Dictionary<string, YOThemePackageAsset>()
            };

            /* Compute signature over content (exclude signature itself) */
            var sig = new YOThemePackageSignature { hashAlgorithm = "sha256" };
            var forHash = JsonConvert.SerializeObject(new
            {
                pkg.manifestVersion,
                pkg.exportedAt,
                meta = pkg.meta,
                config = pkg.config,
                assets = pkg.assets
            });
            using (var sha256 = System.Security.Cryptography.SHA256.Create())
            {
                var bytes = System.Text.Encoding.UTF8.GetBytes(forHash);
                var hashBytes = sha256.ComputeHash(bytes);
                sig.hash = string.Concat(hashBytes.Select(b => b.ToString("x2")));
            }
            pkg.signature = sig;

            return new YOThemeResult
            {
                Success = true,
                Message = "Success",
                Data = pkg
            };
        }
        catch (Exception ex)
        {
            return new YOThemeResult { Success = false, Message = ex.Message };
        }
    }

    public async Task<YOThemeResult> ImportThemeAsync(string json)
    {
        try
        {
            /* Try to deserialize as the new YOThemePackage format first */
            YOThemePackage pkg = null;
            try { pkg = JsonConvert.DeserializeObject<YOThemePackage>(json); } catch { }

            if (pkg != null && pkg.manifestVersion != null && pkg.config != null)
            {
                /* Verify integrity */
                var sig = pkg.signature;
                var forHash = JsonConvert.SerializeObject(new
                {
                    pkg.manifestVersion,
                    pkg.exportedAt,
                    meta = pkg.meta,
                    config = pkg.config,
                    assets = pkg.assets
                });
                using (var sha256 = System.Security.Cryptography.SHA256.Create())
                {
                    var bytes = System.Text.Encoding.UTF8.GetBytes(forHash);
                    var hashBytes = sha256.ComputeHash(bytes);
                    var computed = string.Concat(hashBytes.Select(b => b.ToString("x2")));
                    if (computed != sig.hash)
                        return new YOThemeResult { Success = false, Message = "Package integrity check failed — signature mismatch." };
                }

                var importName = pkg.meta?.name ?? "Imported Theme";
                var importSlug = pkg.meta?.slug ?? importName.ToLower().Replace(" ", "-");
                var request = new YOThemeSaveRequest
                {
                    YOThemeUniqueId = Guid.NewGuid().ToString(),
                    Name = importName,
                    Slug = importSlug,
                    Version = pkg.meta?.version ?? "1.0.0",
                    Author = pkg.meta?.author,
                    Description = pkg.meta?.description,
                    Tags = pkg.meta?.tags,
                    Config = pkg.config
                };
            return await SaveAsync(request);
            }

            /* Fallback: legacy YOThemeImportRequest */
            var import = JsonConvert.DeserializeObject<YOThemeImportRequest>(json);
            if (import == null || string.IsNullOrEmpty(import.Name))
                return new YOThemeResult { Success = false, Message = "Invalid theme JSON" };

            var existingResult = await GetAsync(import.OverwriteGUID);
            var saveRequest = new YOThemeSaveRequest
            {
                YOThemeUniqueId = import.OverwriteGUID,
                Name = import.Name,
                Slug = import.Slug ?? import.Name.ToLower().Replace(" ", "-"),
                Version = import.Version ?? "1.0.0",
                Author = import.Author,
                Description = import.Description,
                Tags = import.Tags,
                Config = import.Config,
                IsSystem = false,
                ParentYOThemeId = null
            };

            return await SaveAsync(saveRequest);
        }
        catch (JsonException ex)
        {
            return new YOThemeResult { Success = false, Message = $"Invalid JSON: {ex.Message}" };
        }
        catch (Exception ex)
        {
            return new YOThemeResult { Success = false, Message = ex.Message };
        }
    }

    public async Task<YOThemeAssignmentResult> GetThemeAssignmentsAsync(long yOThemeId)
    {
        try
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();

                var results = new List<YOThemeAssignment>();

                // Query layouts using this theme
                var layouts = await db.QueryAsync(
                    "SELECT MasterLayoutId AS EntityId, MasterLayoutUniqueId AS EntityGUID, Name AS EntityName FROM dbo.MasterLayout WHERE YOThemeId = @Id AND IsDeleted = 0",
                    new { Id = yOThemeId });

                foreach (var l in layouts)
                {
                    results.Add(new YOThemeAssignment
                    {
                        EntityType = "Layout",
                        EntityId = l.EntityId,
                        EntityGUID = l.EntityGUID,
                        EntityName = l.EntityName
                    });
                }

                // Query pages using this theme
                var pages = await db.QueryAsync(
                    "SELECT PageId AS EntityId, PageUniqueId AS EntityGUID, Name AS EntityName FROM dbo.Page WHERE YOThemeId = @Id AND IsDeleted = 0",
                    new { Id = yOThemeId });

                foreach (var p in pages)
                {
                    results.Add(new YOThemeAssignment
                    {
                        EntityType = "Page",
                        EntityId = p.EntityId,
                        EntityGUID = p.EntityGUID,
                        EntityName = p.EntityName
                    });
                }

                return new YOThemeAssignmentResult
                {
                    Success = true,
                    Message = "Success",
                    Data = results
                };
            }
        }
        catch (Exception ex)
        {
            return new YOThemeAssignmentResult { Success = false, Message = ex.Message };
        }
    }
}
