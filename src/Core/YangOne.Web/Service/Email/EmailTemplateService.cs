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
            if (string.IsNullOrEmpty(emailTemplate.HeaderTemplate))
            {
                var header = await GetDefaultHeaderTemplate();
                emailTemplate.HeaderTemplate = header?.Template ?? "";
            }
            if (string.IsNullOrEmpty(emailTemplate.FooterTemplate))
            {
                var footer = await GetDefaultFooterTemplate();
                emailTemplate.FooterTemplate = footer?.Template ?? "";
            }
            await TemplateCRUDService.InsertAsync<int>(emailTemplate);
        }
        else
        {
            await TemplateCRUDService.UpdateAsync(emailTemplate);
        }
    }

    public async Task<EmailTemplate> GetDefaultHeaderTemplate()
    {
        return await TemplateCRUDService.GetAsync(
            "Where TemplateName=@Name and IsDeleted=@Deleted",
            new { Name = "_HEADER", Deleted = false });
    }

    public async Task<EmailTemplate> GetDefaultFooterTemplate()
    {
        return await TemplateCRUDService.GetAsync(
            "Where TemplateName=@Name and IsDeleted=@Deleted",
            new { Name = "_FOOTER", Deleted = false });
    }

    public string CombineTemplate(EmailTemplate template)
    {
        var header = template.HeaderTemplate ?? "";
        var body = template.Template ?? "";
        var footer = template.FooterTemplate ?? "";
        return $@"<!DOCTYPE html>
<html lang=""en"">
<head>
    <meta charset=""utf-8"" />
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
</head>
<body style=""margin:0; padding:0; background:#eef4fb; font-family:'PT Sans', Arial, Helvetica, sans-serif;"">
    <center>
        <table width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"" bgcolor=""#eef4fb"" style=""margin:0; padding:0; width:100%; height:100%;"">
            <tr>
                <td align=""center"" valign=""top"">
                    <table width=""600"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""width:600px;"">
                        <tr>
                            <td style=""font-size:0pt; line-height:0pt; padding:0; margin:0;"">
                                <table width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
                                    <tr>
                                        <td style=""padding:0 10px;"">
                                            <table width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
                                                <tr>
                                                    <td style=""font-size:12px; line-height:16px; font-family:'PT Sans', Arial, sans-serif; color:#6f7b8a; text-align:right; padding-top:20px; padding-bottom:20px;"">
                                                        <a href=""{{WebVersionUrl}}"" target=""_blank"" style=""text-decoration:none; color:#6f7b8a;"">View this email in your browser</a>
                                                    </td>
                                                </tr>
                                            </table>
                                            <table width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
                                                <tr>
                                                    <td bgcolor=""#008cff"" style=""border-radius:10px 10px 0 0; padding-top:10px;"">
                                                        <table width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
                                                            <tr>
                                                                <td bgcolor=""#ffffff"" style=""border-radius:10px 10px 0 0;"">
                                                                    <table width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
                                                                        <tr>
                                                                            <td style=""padding:0;"">
                                                                                {header}
                                                                                {body}
                                                                                {footer}
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>";
    }
}
