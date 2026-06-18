// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Data;
using YangOne.Web.Localization;

namespace YangOne.Localization
{
    /// <summary>
    /// Provides localization services for regions and resources.
    /// </summary>
    public interface ILocaleService
    {
        CrudService<LocaleRegion> RegionCrudService { get; set; }
        Task<IEnumerable<LocaleRegion>> GetRegions();
        CrudService<LocaleResource> CrudService { get; set; }
        Task<IEnumerable<LocaleRegionViewModel>> GetLocaleRegions(int page, int limit, string search);
        Task Save(LocaleResource model);
        Task<bool> CheckAlreadyExist(int countryId, string culture);
        Task<LocaleRegionEditViewModel> GetAllResourcesAsync(int localRegionId, string baseCulture, int page, int limit);
        Task<bool> SetDefaultAsync(int localeRegionId);
        Task<bool> AddNewResourceFromBaseCultureAsync(string culture);
        Task<LocaleRegion> GetDefaultLocaleRegion();
        Task<IEnumerable<LocaleResourcesExportModel>> GetAllResourcesForExportAsync(int localRegionId, string baseCulture);
        Task<ImportedStatus> ImportLocaleResources(List<LocaleResourcesImportModel> importedDatas, string addedBy);
    }
}
