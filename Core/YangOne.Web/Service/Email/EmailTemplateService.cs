using YangOne.Data;
using YangOne.Web.Model;
namespace YangOne.Web.Services;
public class EmailTemplateService : IEmailTemplateService
{
    public CrudService<EmailTemplate> TemplateCRUDService { get; set; } = new CrudService<EmailTemplate>();

    public async Task SaveEmailTemplate(EmailTemplate emailTemplate)
    {
        if (emailTemplate.TemplateId == 0)
        {
            await TemplateCRUDService.InsertAsync<int>(emailTemplate);
        }
        else
        {
            await TemplateCRUDService.UpdateAsync(emailTemplate);
        }
    }

}