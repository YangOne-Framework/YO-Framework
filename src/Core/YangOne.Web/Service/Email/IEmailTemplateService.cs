// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Data;
using YangOne.Web.Model;

/// <summary>
/// Defines the contract for email template operations.
/// </summary>
public interface IEmailTemplateService
{
    CrudService<EmailTemplate> TemplateCRUDService { get; set; }
    Task SaveEmailTemplate(EmailTemplate emailTemplate);
    Task<EmailTemplate> GetDefaultHeaderTemplate();
    Task<EmailTemplate> GetDefaultFooterTemplate();
    string CombineTemplate(EmailTemplate template);
}
