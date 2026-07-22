using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using YangOne.Data.Crud.Attribute;

namespace YangOne.Web;

[Table("YOTheme")]
public class YOTheme
{
    [Key]
    public long YOThemeId { get; set; }

    [Required]
    public string YOThemeUniqueId { get; set; }

    [Required]
    public string Name { get; set; }

    [Required]
    public string Slug { get; set; }

    public string Version { get; set; }

    public string Author { get; set; }

    public string Description { get; set; }

    public string Tags { get; set; }

    public string Screenshot { get; set; }

    public string Config { get; set; }

    public bool IsActive { get; set; }

    public bool IsSystem { get; set; }

    public long? ParentYOThemeId { get; set; }

    public string PackagePath { get; set; }

    public string PackageHash { get; set; }

    public bool IsDeleted { get; set; }

    [AutoFill(AutoFillProperty.CurrentDate)]
    [IgnoreUpdate]
    public DateTime AddedOn { get; set; }

    [AutoFill(AutoFillProperty.CurrentUserId)]
    [IgnoreUpdate]
    public long AddedBy { get; set; }

    [AutoFill(AutoFillProperty.CurrentUserId)]
    [IgnoreUpdate]
    public long DeletedBy { get; set; }

    [AutoFill(AutoFillProperty.CurrentDate)]
    [IgnoreInsert]
    public DateTime DeletedOn { get; set; }

    [AutoFill(AutoFillProperty.CurrentDate)]
    [IgnoreInsert]
    public DateTime UpdatedOn { get; set; }

    [AutoFill(AutoFillProperty.CurrentUserId)]
    [IgnoreInsert]
    public long UpdatedBy { get; set; }

    [IgnoreAll]
    public int OverrideCount { get; set; }

    [IgnoreAll]
    public string ParentThemeName { get; set; }

    [IgnoreAll]
    public int RowTotal { get; set; }
}

// ── View model for admin list ──

public class YOThemeListItem
{
    public long YOThemeId { get; set; }
    public string YOThemeUniqueId { get; set; }
    public string Name { get; set; }
    public string Slug { get; set; }
    public string Version { get; set; }
    public string Author { get; set; }
    public string Description { get; set; }
    public string Tags { get; set; }
    public string Screenshot { get; set; }
    public string Config { get; set; }
    public bool IsActive { get; set; }
    public bool IsSystem { get; set; }
    public long? ParentYOThemeId { get; set; }
    public string ParentThemeName { get; set; }
    public long RowTotal { get; set; }
}

// ── Override entity ──

[Table("YOThemeOverride")]
public class YOThemeOverride
{
    [Key]
    public long YOThemeOverrideId { get; set; }

    public long YOThemeId { get; set; }

    public string KeyPath { get; set; }

    public string Value { get; set; }

    public DateTime AddedOn { get; set; }

    public long AddedBy { get; set; }
}

// ── Asset entity ──

[Table("YOThemeAsset")]
public class YOThemeAsset
{
    [Key]
    public long YOThemeAssetId { get; set; }

    public long YOThemeId { get; set; }

    public string AssetPath { get; set; }

    public string AssetType { get; set; }

    public long FileSize { get; set; }

    public string FileHash { get; set; }

    public DateTime AddedOn { get; set; }
}

// ── Request DTOs ──

public class YOThemeSaveRequest
{
    public string YOThemeUniqueId { get; set; }
    public string Name { get; set; }
    public string Slug { get; set; }
    public string Version { get; set; }
    public string Author { get; set; }
    public string Description { get; set; }
    public string Tags { get; set; }
    public string Config { get; set; }
    public bool IsSystem { get; set; }
    public long? ParentYOThemeId { get; set; }
}

public class YOThemeActivateRequest
{
    public string YOThemeUniqueId { get; set; }
}

public class YOThemeDeleteRequest
{
    public string YOThemeUniqueId { get; set; }
    public bool CascadeLayouts { get; set; }
}

public class YOThemeOverrideSaveRequest
{
    public string YOThemeUniqueId { get; set; }
    public Dictionary<string, object> Overrides { get; set; }
}

// ── Response DTOs ──

public class YOThemeResult
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public object Data { get; set; }
    public List<YOThemeListItem> DataList { get; set; }
    public string Action { get; set; }
    public int RowTotal { get; set; }
}

public class YOThemeOverrideResult
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public List<YOThemeOverride> Data { get; set; }
}

public class YOThemeAssetResult
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public List<YOThemeAsset> Data { get; set; }
}

public class YOThemeAssignmentResult
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public List<YOThemeAssignment> Data { get; set; }
}

public class YOThemeAssignment
{
    public string EntityType { get; set; } // "Layout" or "Page"
    public long EntityId { get; set; }
    public string EntityGUID { get; set; }
    public string EntityName { get; set; }
}

/// <summary>
/// Comprehensive export package — mirrors the front-end .yo-theme.json format.
/// Includes full config, meta, embedded assets, and an integrity signature.
/// </summary>
public class YOThemePackage
{
    public string manifestVersion { get; set; } = "1.0";
    public string exportedAt { get; set; }
    public YOThemePackageSignature signature { get; set; }
    public YOThemePackageMeta meta { get; set; }
    public string config { get; set; } // JSON string of ParsedThemeConfig
    public Dictionary<string, YOThemePackageAsset> assets { get; set; } = new();
}

public class YOThemePackageSignature
{
    public string hash { get; set; }
    public string hashAlgorithm { get; set; } = "sha256";
}

public class YOThemePackageMeta
{
    public string name { get; set; }
    public string slug { get; set; }
    public string version { get; set; }
    public string author { get; set; }
    public string description { get; set; }
    public string tags { get; set; }
}

public class YOThemePackageAsset
{
    public string data { get; set; } // base64-encoded
    public string mime { get; set; }
    public string filename { get; set; }
}

/// <summary>
/// Legacy simple export (kept for backward compatibility).
/// </summary>
public class YOThemeExport
{
    public string Name { get; set; }
    public string Slug { get; set; }
    public string Version { get; set; }
    public string Author { get; set; }
    public string Description { get; set; }
    public string Tags { get; set; }
    public string Config { get; set; }
}

public class YOThemeImportRequest
{
    public string Name { get; set; }
    public string Slug { get; set; }
    public string Version { get; set; }
    public string Author { get; set; }
    public string Description { get; set; }
    public string Tags { get; set; }
    public string Config { get; set; }
    public string OverwriteGUID { get; set; } // set to update existing
}
