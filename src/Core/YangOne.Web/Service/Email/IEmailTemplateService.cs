using YangOne.Data;
using YangOne.Web.Model;

public interface IEmailTemplateService
{
    CrudService<EmailTemplate> TemplateCRUDService { get; set; }
    Task SaveEmailTemplate(EmailTemplate emailTemplate);
    Task<EmailTemplate> GetDefaultHeaderTemplate();
    Task<EmailTemplate> GetDefaultFooterTemplate();
    string CombineTemplate(EmailTemplate template);
}