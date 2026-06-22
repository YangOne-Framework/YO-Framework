// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Data;
using YangOne.Web.Model;

namespace YangOne.Web.Services
{
    /// <summary>
    /// Defines the contract for email service provider management.
    /// </summary>
    public interface IEmailServiceProviderService
    {

        CrudService<EmailServiceProvider> ProviderCrudService { get; set; }
        CrudService<EmailServiceProviderSetting> SettingCrudService { get; set; }
        Task<IEmailSender> GetDefaultEmailSender();
        Task<IEnumerable<EmailServiceProviderSetting>> GetSettings(int emailServiceProviderId);
        Task<IEnumerable<EmailServiceProviderSetting>> GetSettings(string name);
        Task<T> GetSettingsAsync<T>(int emailServiceProviderId) where T : class;
        Task<T> GetSettingsAsync<T>(string name) where T : class;
        Task<bool> SaveSetting<T>(T setting, int emailServiceProviderId);
        Task<bool> SetDefaultProviderAsync(int id);
        Task<EmailServiceProvider> GetDefaultProviderAsync();
        Task<bool> UpdateSettings(List<EmailServiceProviderSetting> settings);
        Task<bool> UpdateStatus(EmailServiceProvider model);
        Task<int> InsertOrSave(EmailServiceProvider model);
        Task<bool> DeleteEmailService(string name);
    }

}
