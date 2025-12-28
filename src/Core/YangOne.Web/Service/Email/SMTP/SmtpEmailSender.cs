using YangOne.Web.Service;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using System.Net.Mail;
using YangOne.Configuration;
using System.Net.Mime;

namespace YangOne.Web.Services
{
    public class SmtpEmailSender : IEmailSender
    {
        private readonly SmtpEmailSetting _setting;
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly ITemplateEngine _templateEngine;

        private readonly YangOneAppConfig _yoAppConfig;
        public string Name { get; } = "SMTPSENDER";
        public SmtpEmailSender(IOptionsSnapshot<YangOneAppConfig> configOption,
            IWebHostEnvironment hostingEnvironment, ITemplateEngine templateEngine)
        {
            
            _hostingEnvironment = hostingEnvironment;
            _templateEngine = templateEngine;
            _yoAppConfig = configOption.Value;
            _setting = new SmtpEmailSetting
            {
                Host = _yoAppConfig.SMTMConfig.Host,
                Password = _yoAppConfig.SMTMConfig.Password,
                Port = _yoAppConfig.SMTMConfig.Port,
                UseSSL = _yoAppConfig.SMTMConfig.UseSSL,
                UserName = _yoAppConfig.SMTMConfig.UserName
            };
        }
        private async Task _sendEmailAsync(
            EmailAddress from,
            IEnumerable<EmailAddress> recipients,
            string subject,
            string text,
            string html)
        {
            try

            {


                var message = new MailMessage { From = new MailAddress(@from.Email, @from.DisplayName ?? "") };

                foreach (var recipient in recipients)
                {
                    message.To.Add(new MailAddress(recipient.Email, recipient.DisplayName ?? ""));
                }

                message.Subject = subject;
                message.Body = string.IsNullOrEmpty(text) ? html : text;
                message.IsBodyHtml = !string.IsNullOrEmpty(html);
                var email = new Email()
                {
                    From = from,
                    MessageHtml = html,
                    MessageText = text,
                    Subject = subject,
                    To = recipients.ToArray()
                };
                var smtpclient = new SmtpClient
                {
                    UseDefaultCredentials = false,
                    Host = _setting.Host,
                    Port = _setting.Port,
                    Credentials = new System.Net.NetworkCredential(_setting.UserName, _setting.Password),
                    EnableSsl = _setting.UseSSL
                };

                smtpclient.SendCompleted += Smtpclient_SendCompleted;
                smtpclient.SendAsync(message, new SendAsyncState(email));


            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public async Task _sendEmailAsync(
            EmailAddress from,
            IEnumerable<EmailAddress> recipients,
            string subject,
            string text,
            string html, string[] files)
        {
            try

            {


                var message = new MailMessage { From = new MailAddress(@from.Email, @from.DisplayName ?? "") };

                foreach (var recipient in recipients)
                {
                    message.To.Add(new MailAddress(recipient.Email, recipient.DisplayName ?? ""));
                }

                message.Subject = subject;
                message.Body = string.IsNullOrEmpty(text) ? html : text;
                message.IsBodyHtml = !string.IsNullOrEmpty(html);
                var email = new Email()
                {
                    From = from,
                    MessageHtml = html,
                    MessageText = text,
                    Subject = subject,
                    To = recipients.ToArray()
                };
                var smtpclient = new SmtpClient
                {
                    UseDefaultCredentials = false,
                    Host = _setting.Host,
                    Port = _setting.Port,
                    Credentials = new System.Net.NetworkCredential(_setting.UserName, _setting.Password),
                    EnableSsl = _setting.UseSSL
                };
                foreach (var file in files)
                {
                    if (File.Exists(file))
                    {
                        Attachment attachment = new Attachment(file, MediaTypeNames.Application.Octet);
                        ContentDisposition disposition = attachment.ContentDisposition;
                        disposition.CreationDate = File.GetCreationTime(file);
                        disposition.ModificationDate = File.GetLastWriteTime(file);
                        disposition.ReadDate = File.GetLastAccessTime(file);
                        disposition.FileName = Path.GetFileName(file);
                        disposition.Size = new FileInfo(file).Length;
                        disposition.DispositionType = DispositionTypeNames.Attachment;
                        message.Attachments.Add(attachment);
                    }
                }

                smtpclient.SendCompleted += Smtpclient_SendCompleted;
                smtpclient.SendAsync(message, new SendAsyncState(email));


            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public async Task SendEmailAsync(string subject, string message, params EmailAddress[] to)
        {
            var settingService = ContextResolver.Context.RequestServices.GetService<ISettingService>();
            var webSetting = await settingService.GetSetting();
            string senderEmail = webSetting.DefaultEmail;
            if (string.IsNullOrEmpty(senderEmail))
            {
                senderEmail = "info@yoframework.com";
            }
            _sendEmailAsync(
              new EmailAddress() { Email = senderEmail, DisplayName = webSetting?.WebsiteName??"YO" }, to, subject,
              message, "");
            


        }

        public Task SendEmailAsync(EmailAddress from, string subject, string message, params EmailAddress[] to)
        {
            return _sendEmailAsync(from, to, subject, message, "");
        }
        
        public async Task SendEmailTemplateAsync<T>(string subject, string template, T context, params EmailAddress[] to)
        {

            var settingService = ContextResolver.Context.RequestServices.GetService<ISettingService>();
            var webSetting = await settingService.GetSetting();
            string senderEmail = webSetting.DefaultEmail;
            if (string.IsNullOrEmpty(senderEmail))
            {
                senderEmail = "info@yoframework.com";
            }
            template = _templateEngine.Render(template, context);
            await _sendEmailAsync(new EmailAddress() { Email = senderEmail, DisplayName = webSetting?.WebsiteName ?? "YO" }, to, subject, "", template);
        }

        public async Task SendTemplatedEmailAsync<T>(string subject, string templateKey, T context, params EmailAddress[] to)
        {
            var settingService = ContextResolver.Context.RequestServices.GetService<ISettingService>();
            var webSetting = await settingService.GetSetting();
            string senderEmail = webSetting.DefaultEmail;
            if (string.IsNullOrEmpty(senderEmail))
            {
                senderEmail = "info@yoframework.com";
            }
            string template = _templateEngine.RenderFromFile(templateKey, context, true);
            await _sendEmailAsync(new EmailAddress() { Email = senderEmail, DisplayName = webSetting?.WebsiteName ?? "YO" }, to, subject, "", template);
        }

        public async Task SendTemplatedEmailWithAttachmentAsync<T>(string subject, string templateKey, T context, string[] files,
            params EmailAddress[] to)
        {
            var settingService = ContextResolver.Context.RequestServices.GetService<ISettingService>();
            var webSetting = await settingService.GetSetting();
            string senderEmail = webSetting.DefaultEmail;
            if (string.IsNullOrEmpty(senderEmail))
            {
                senderEmail = "info@yoframework.com";
            }
            string template = _templateEngine.RenderFromFile(templateKey, context, true);
            await _sendEmailAsync(new EmailAddress() { Email = senderEmail, DisplayName = webSetting?.WebsiteName ?? "YO" }, to, subject, "", template, files);
        }

        public async Task SendTemplatedEmailAsync<T>(EmailAddress from, string subject, string templateKey, T context, params EmailAddress[] to)
        {
            string template = _templateEngine.RenderFromFile(templateKey, context, true);
            await _sendEmailAsync(from, to, subject, "", template);

        }

        private void Smtpclient_SendCompleted(object sender, System.ComponentModel.AsyncCompletedEventArgs e)
        {
            var smtpClient = (SmtpClient)sender;
            var userAsyncState = (SendAsyncState)e.UserState;
            if (e.Error != null)
                Console.WriteLine("Error sending email.");
            else if (e.Cancelled)
                Console.WriteLine("Sending of email cancelled.");
            smtpClient.SendCompleted -= Smtpclient_SendCompleted;
        }
    }
}