namespace YangOne.Web;

public interface IYOThemeService
{
    Task<YOThemeResult> SaveAsync(YOThemeSaveRequest request);
    Task<YOThemeResult> GetAsync(string yOThemeGUID = null, long? yOThemeId = null);
    Task<YOThemeResult> GetActiveAsync();
    Task<YOThemeResult> ListAsync(int offset = 1, int limit = 20, string search = "", string status = "all");
    Task<YOThemeResult> DeleteAsync(string yOThemeGUID, bool cascadeLayouts = false);
    Task<YOThemeResult> ActivateAsync(string yOThemeGUID);
    Task<YOThemeOverrideResult> SaveOverridesAsync(string yOThemeGUID, Dictionary<string, object> overrides);
    Task<YOThemeOverrideResult> GetOverridesAsync(long yOThemeId);
    Task<YOThemeOverrideResult> ClearOverridesAsync(long yOThemeId);
    Task<YOThemeResult> ExportThemeJsonAsync(string yOThemeGUID);
    Task<YOThemeResult> ImportThemeAsync(string json);
    Task<YOThemeAssignmentResult> GetThemeAssignmentsAsync(long yOThemeId);
}
