using System.Data.Common;
using Dapper;
using Newtonsoft.Json;
using YangOne.Data;
using YangOne.Data.Extension;
using YangOne.Log;

namespace YangOne.Web;

public class MasterLayoutService : IMasterLayoutService
{
    private readonly ILogger _logger;
    public CrudService<MasterLayout> CrudService { get; set; } = new CrudService<MasterLayout>();

    public MasterLayoutService(ILogger logger)
    {
        _logger = logger;
    }

    public async Task<MasterLayoutResult> GetListAsync()
    {
        try
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                var data = (await db.QueryAsync<MasterLayout>(
                    "usp_MasterLayout_List",
                    commandType: System.Data.CommandType.StoredProcedure)).ToList();

                return new MasterLayoutResult
                {
                    Success = true,
                    Message = "Success",
                    DataList = data
                };
            }
        }
        catch (Exception ex)
        {
            _logger.Log(LogType.Error, () => ex.Message, ex);
            return new MasterLayoutResult { Success = false, Message = ex.Message };
        }
    }

    public async Task<MasterLayoutResult> GetListLightAsync()
    {
        try
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                var data = (await db.QueryAsync<MasterLayout>(
                    "usp_MasterLayout_ListLight",
                    commandType: System.Data.CommandType.StoredProcedure)).ToList();

                return new MasterLayoutResult
                {
                    Success = true,
                    Message = "Success",
                    DataList = data
                };
            }
        }
        catch (Exception ex)
        {
            _logger.Log(LogType.Error, () => ex.Message, ex);
            return new MasterLayoutResult { Success = false, Message = ex.Message };
        }
    }

    public async Task<MasterLayoutResult> GetByGuidAsync(string layoutGuid)
    {
        try
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                var data = await db.QueryFirstOrDefaultAsync<MasterLayout>(
                    "usp_MasterLayout_Get",
                    new { LayoutGUID = layoutGuid },
                    commandType: System.Data.CommandType.StoredProcedure);

                if (data == null)
                    return new MasterLayoutResult { Success = false, Message = "Layout not found" };

                return new MasterLayoutResult
                {
                    Success = true,
                    Message = "Success",
                    Data = data
                };
            }
        }
        catch (Exception ex)
        {
            _logger.Log(LogType.Error, () => ex.Message, ex);
            return new MasterLayoutResult { Success = false, Message = ex.Message };
        }
    }

    public async Task<MasterLayoutResult> SaveAsync(MasterLayoutSaveRequest request)
    {
        try
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                var result = await db.QueryFirstAsync(
                    "usp_MasterLayout_Save",
                    new
                    {
                        LayoutGUID = request.LayoutGUID,
                        Name = request.Name,
                        Description = request.Description,
                        HasHeader = request.HasHeader,
                        HasFooter = request.HasFooter,
                        Sidebar = request.Sidebar,
                        IsSystem = request.IsSystem,
                        LayoutConfig = request.LayoutConfig,
                        UpdatedBy = 0
                    },
                    commandType: System.Data.CommandType.StoredProcedure);

                string action = result.Action;
                long layoutId = result.LayoutId;

                var layout = await CrudService.GetAsync(layoutId);

                return new MasterLayoutResult
                {
                    Success = true,
                    Message = action == "inserted" ? "Layout created" : "Layout updated",
                    Data = layout,
                    Action = action
                };
            }
        }
        catch (Exception ex)
        {
            return new MasterLayoutResult { Success = false, Message = ex.Message };
        }
    }

    public async Task<MasterLayoutResult> DeleteAsync(string layoutGuid)
    {
        try
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                var result = await db.QueryFirstAsync(
                    "usp_MasterLayout_Delete",
                    new { LayoutGUID = layoutGuid, DeletedBy = 0 },
                    commandType: System.Data.CommandType.StoredProcedure);

                string action = result.Action;

                if (action == "cannot_delete_system")
                    return new MasterLayoutResult { Success = false, Message = "System layouts cannot be deleted" };

                if (action == "not_found")
                    return new MasterLayoutResult { Success = false, Message = "Layout not found" };

                return new MasterLayoutResult
                {
                    Success = true,
                    Message = "Layout deleted",
                    Action = action
                };
            }
        }
        catch (Exception ex)
        {
            return new MasterLayoutResult { Success = false, Message = ex.Message };
        }
    }
}
