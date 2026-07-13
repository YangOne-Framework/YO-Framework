namespace YangOne.Web;

public interface IMasterLayoutService
{
    Task<MasterLayoutResult> GetListAsync();
    Task<MasterLayoutResult> GetListLightAsync();
    Task<MasterLayoutResult> GetByGuidAsync(string layoutGuid);
    Task<MasterLayoutResult> SaveAsync(MasterLayoutSaveRequest request);
    Task<MasterLayoutResult> DeleteAsync(string layoutGuid);
}

public class MasterLayoutResult
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public MasterLayout Data { get; set; }
    public List<MasterLayout> DataList { get; set; }
    public string Action { get; set; }
}

public class MasterLayoutSaveRequest
{
    public string LayoutGUID { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public bool HasHeader { get; set; } = true;
    public bool HasFooter { get; set; } = true;
    public string Sidebar { get; set; } = "none";
    public bool IsSystem { get; set; }
    public string LayoutConfig { get; set; }
}
