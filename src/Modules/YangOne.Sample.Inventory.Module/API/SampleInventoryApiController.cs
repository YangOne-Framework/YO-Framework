// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Data.Common;
using System.Reflection;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using YangOne.Data;
using YangOne.Web.API;
using YangOne.Web.Module;

namespace YangOne.Sample.Inventory.Module.API
{
    [Route("api/modules/YangOne.Sample.Inventory/v1")]
    public class SampleInventoryApiController : BaseModuleApiController
    {
        private const string ModuleId = "YangOne.Sample.Inventory";
        private readonly IModuleService _moduleService;

        public SampleInventoryApiController(IModuleService moduleService) : base(moduleService)
        {
            _moduleService = moduleService;
        }

        protected override string ModuleName => ModuleId;

        [HttpGet("ping")]
        public async Task<ActionResult<ApiResponse<SampleInventoryPingDto>>> Ping()
        {
            var module = await _moduleService.GetByNameAsync(ModuleId);
            var items = await GetItemsAsync();

            return SuccessResponse("Success", new SampleInventoryPingDto
            {
                ModuleName = ModuleId,
                AssemblyVersion = GetAssemblyVersion(),
                ActiveVersion = module?.ActiveVersion ?? module?.Version ?? string.Empty,
                LifecycleState = module?.LifecycleState ?? string.Empty,
                RuntimeState = module?.RuntimeState ?? string.Empty,
                ItemCount = items.Count,
                UpgradeColumnAvailable = await HasColumnAsync("Sku")
            });
        }

        [HttpGet("items")]
        public async Task<ActionResult<ApiResponse<IEnumerable<SampleInventoryItemDto>>>> Items()
        {
            var items = await GetItemsAsync();
            return SuccessResponse<IEnumerable<SampleInventoryItemDto>>("Success", items);
        }

        private static async Task<List<SampleInventoryItemDto>> GetItemsAsync()
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using var db = (DbConnection)dbFactory.GetConnection();
            await db.OpenAsync();

            var hasSku = await HasColumnAsync(db, "Sku");
            var sql = hasSku
                ? @"SELECT ItemId, Name, Quantity, Sku, SchemaVersion, AddedOn FROM dbo.YO_ModuleSampleInventoryItem ORDER BY ItemId"
                : @"SELECT ItemId, Name, Quantity, CAST(NULL AS nvarchar(64)) AS Sku, SchemaVersion, AddedOn FROM dbo.YO_ModuleSampleInventoryItem ORDER BY ItemId";

            var rows = await db.QueryAsync<SampleInventoryItemDto>(sql);
            return rows.ToList();
        }

        private static async Task<bool> HasColumnAsync(string columnName)
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using var db = (DbConnection)dbFactory.GetConnection();
            await db.OpenAsync();
            return await HasColumnAsync(db, columnName);
        }

        private static async Task<bool> HasColumnAsync(DbConnection db, string columnName)
        {
            var result = await db.ExecuteScalarAsync<int>(
                "SELECT CASE WHEN COL_LENGTH('dbo.YO_ModuleSampleInventoryItem', @ColumnName) IS NULL THEN 0 ELSE 1 END",
                new { ColumnName = columnName });
            return result == 1;
        }

        private static string GetAssemblyVersion()
        {
            var version = typeof(SampleInventoryApiController).Assembly
                .GetCustomAttribute<AssemblyInformationalVersionAttribute>()?
                .InformationalVersion;

            return string.IsNullOrWhiteSpace(version) ? "1.0.0" : version.Split('+')[0];
        }
    }

    public class SampleInventoryPingDto
    {
        public string ModuleName { get; set; } = string.Empty;
        public string AssemblyVersion { get; set; } = string.Empty;
        public string ActiveVersion { get; set; } = string.Empty;
        public string LifecycleState { get; set; } = string.Empty;
        public string RuntimeState { get; set; } = string.Empty;
        public int ItemCount { get; set; }
        public bool UpgradeColumnAvailable { get; set; }
    }

    public class SampleInventoryItemDto
    {
        public int ItemId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string Sku { get; set; } = string.Empty;
        public string SchemaVersion { get; set; } = string.Empty;
        public DateTime AddedOn { get; set; }
    }
}
