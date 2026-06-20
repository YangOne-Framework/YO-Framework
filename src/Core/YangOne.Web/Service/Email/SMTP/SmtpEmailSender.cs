// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;
using System.Linq.Expressions;
using System.Net;
using System.Net.Mail;
using System.Net.Mime;
using System.Text;
using YangOne.Configuration;
using YangOne.Data.Extension;
using YangOne.Job;
using YangOne.Web.Model;
using YangOne.Web.Service;

namespace YangOne.Web.Services
{
    /// <summary>
    /// Sends email messages using the SMTP protocol via background job runner.
    /// </summary>

    public sealed class SmtpEmailSender : IEmailSender
    {
        private const string DefaultSenderEmail = "info@yoframework.com";
        private const string DefaultSenderName = "YO";

        private readonly SmtpEmailSetting _smtpSetting;
        private readonly ITemplateEngine _templateEngine;
        private readonly ISettingService _settingService;
        private readonly IJobRunner _jobRunner;
        private readonly IEmailLogService _emailLogService;

        public string Name => "SMTPSENDER";

        public SmtpEmailSender(
            IOptionsSnapshot<YangOneAppConfig> configurationOptions,
            ITemplateEngine templateEngine,
            ISettingService settingService,
            IJobRunner jobRunner,IEmailLogService emailLogService)
        {
            ArgumentNullException.ThrowIfNull(configurationOptions);
            ArgumentNullException.ThrowIfNull(templateEngine);
            ArgumentNullException.ThrowIfNull(settingService);
            ArgumentNullException.ThrowIfNull(jobRunner);

            var applicationConfiguration = configurationOptions.Value
                                           ?? throw new InvalidOperationException(
                                               $"{nameof(YangOneAppConfig)} configuration is missing.");

            var smtpConfiguration = applicationConfiguration.SMTMConfig
                                    ?? throw new InvalidOperationException(
                                        "SMTP configuration is missing.");

            _templateEngine = templateEngine;
            _settingService = settingService;
            _jobRunner = jobRunner;
            _emailLogService = emailLogService;

            _smtpSetting = new SmtpEmailSetting
            {
                Host = smtpConfiguration.Host,
                Port = smtpConfiguration.Port,
                UserName = smtpConfiguration.UserName,
                Password = smtpConfiguration.Password,
                UseSSL = smtpConfiguration.UseSSL
            };

            ValidateSmtpConfiguration(_smtpSetting);
        }

        public Task SendEmailAsync(
            string subject,
            string message,
            params EmailAddress[] recipients)
        {
            ValidateEmailRequest(subject, recipients);

            return Enqueue(() =>
                SendMessageAsync(
                    subject,
                    message,
                    false,
                    null,
                    recipients));
        }

        public Task SendEmailWithAttachmentAsync(
            string subject,
            string message,
            string[] attachmentFiles,
            params EmailAddress[] recipients)
        {
            ValidateEmailRequest(subject, recipients);
            ValidateAttachmentFiles(attachmentFiles);

            return Enqueue(() =>
                SendMessageAsync(
                    subject,
                    message,
                    false,
                    attachmentFiles,
                    recipients));
        }

        public Task SendTemplatedEmailAsync<TContext>(
            string subject,
            string templateKey,
            TContext context,
            params EmailAddress[] recipients)
        {
            ValidateEmailRequest(subject, recipients);

            ArgumentException.ThrowIfNullOrWhiteSpace(templateKey);
            ArgumentNullException.ThrowIfNull(context);

            return Enqueue(() =>
                SendTemplateMessageAsync(
                    subject,
                    templateKey,
                    context,
                    null,
                    recipients));
        }

        public Task SendTemplatedEmailWithAttachmentAsync<TContext>(
            string subject,
            string templateKey,
            TContext context,
            string[] attachmentFiles,
            params EmailAddress[] recipients)
        {
            ValidateEmailRequest(subject, recipients);

            ArgumentException.ThrowIfNullOrWhiteSpace(templateKey);
            ArgumentNullException.ThrowIfNull(context);

            ValidateAttachmentFiles(attachmentFiles);

            return Enqueue(() =>
                SendTemplateMessageAsync(
                    subject,
                    templateKey,
                    context,
                    attachmentFiles,
                    recipients));
        }

        private Task Enqueue(Expression<Action> emailAction)
        {
            ArgumentNullException.ThrowIfNull(emailAction);

            return _jobRunner.EnqueueAsync(emailAction);
        }

        private async Task SendTemplateMessageAsync<TContext>(
            string subject,
            string templateKey,
            TContext context,
            string[]? attachmentFiles,
            EmailAddress[] recipients)
        {
            var renderedHtml = _templateEngine.RenderFromFile(
                templateKey,
                context,
                true);

            await SendMessageAsync(
                subject,
                renderedHtml,
                true,
                attachmentFiles,
                recipients);
        }

        private async Task SendMessageAsync(
            string subject,
            string body,
            bool isHtmlBody,
            string[]? attachmentFiles,
            EmailAddress[] recipients)
        {
            var emailLog = new EmailLog()
            {
                From =DefaultSenderEmail,
                To = string.Join(",", recipients.Select(x => x.Email)),
                Body = body,
                Subject = subject,
                SentDate = DateTime.Now,
                DeliveredDate = DateTime.Now,
                IsSent = true,
                IsDelivered = false
            };
            emailLog.AutoFill();
            emailLog.EmailLogId = await _emailLogService.LogCrudService.InsertAsync<long>(emailLog);
            var sender = await GetSenderAddressAsync();

            try
            {
                using var mailMessage = CreateMailMessage(
                    sender,
                    recipients,
                    subject,
                    body,
                    isHtmlBody,
                    attachmentFiles);

                using var smtpClient = CreateSmtpClient();

                await smtpClient.SendMailAsync(mailMessage);

                emailLog.IsSent = true;
                emailLog.IsDelivered = true;
                emailLog.DeliveredDate = DateTime.UtcNow;

                await _emailLogService.LogCrudService.UpdateAsync(emailLog);
            }
            catch
            {
                emailLog.IsSent = false;
                emailLog.IsDelivered = false;

                await _emailLogService.LogCrudService.UpdateAsync(emailLog);

                throw;
            }

        }

        private async Task<EmailAddress> GetSenderAddressAsync()
        {
            var websiteSetting = await _settingService.GetSetting();

            return new EmailAddress
            {
                Email = string.IsNullOrWhiteSpace(websiteSetting?.DefaultEmail)
                    ? DefaultSenderEmail
                    : websiteSetting.DefaultEmail,

                DisplayName = string.IsNullOrWhiteSpace(websiteSetting?.WebsiteName)
                    ? DefaultSenderName
                    : websiteSetting.WebsiteName
            };
        }

        private static MailMessage CreateMailMessage(
            EmailAddress sender,
            IEnumerable<EmailAddress> recipients,
            string subject,
            string body,
            bool isHtmlBody,
            IEnumerable<string>? attachmentFiles)
        {
            var mailMessage = new MailMessage
            {
                From = CreateMailAddress(sender),
                Subject = subject,
                SubjectEncoding = Encoding.UTF8,
                Body = body ?? string.Empty,
                BodyEncoding = Encoding.UTF8,
                IsBodyHtml = isHtmlBody
            };

            try
            {
                foreach (var recipient in recipients)
                {
                    mailMessage.To.Add(CreateMailAddress(recipient));
                }

                if (attachmentFiles is not null)
                {
                    foreach (var attachmentFile in attachmentFiles)
                    {
                        mailMessage.Attachments.Add(
                            new Attachment(attachmentFile));
                    }
                }

                return mailMessage;
            }
            catch
            {
                mailMessage.Dispose();
                throw;
            }
        }

        private SmtpClient CreateSmtpClient()
        {
            return new SmtpClient
            {
                Host = _smtpSetting.Host,
                Port = _smtpSetting.Port,
                EnableSsl = _smtpSetting.UseSSL,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(
                    _smtpSetting.UserName,
                    _smtpSetting.Password),
                DeliveryMethod = SmtpDeliveryMethod.Network
            };
        }

        private static MailAddress CreateMailAddress(
            EmailAddress emailAddress)
        {
            ArgumentNullException.ThrowIfNull(emailAddress);
            ArgumentException.ThrowIfNullOrWhiteSpace(emailAddress.Email);

            return new MailAddress(
                emailAddress.Email,
                emailAddress.DisplayName ?? string.Empty,
                Encoding.UTF8);
        }

        private static void ValidateEmailRequest(
            string subject,
            EmailAddress[] recipients)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(subject);
            ArgumentNullException.ThrowIfNull(recipients);

            if (recipients.Length == 0)
            {
                throw new ArgumentException(
                    "At least one email recipient is required.",
                    nameof(recipients));
            }

            if (recipients.Any(recipient =>
                    recipient is null ||
                    string.IsNullOrWhiteSpace(recipient.Email)))
            {
                throw new ArgumentException(
                    "Every recipient must contain a valid email address.",
                    nameof(recipients));
            }
        }

        private static void ValidateAttachmentFiles(
            string[] attachmentFiles)
        {
            ArgumentNullException.ThrowIfNull(attachmentFiles);

            if (attachmentFiles.Length == 0)
            {
                throw new ArgumentException(
                    "At least one attachment file is required.",
                    nameof(attachmentFiles));
            }

            foreach (var attachmentFile in attachmentFiles)
            {
                if (string.IsNullOrWhiteSpace(attachmentFile))
                {
                    throw new ArgumentException(
                        "Attachment file paths cannot be empty.",
                        nameof(attachmentFiles));
                }

                if (!File.Exists(attachmentFile))
                {
                    throw new FileNotFoundException(
                        $"Email attachment was not found: {attachmentFile}",
                        attachmentFile);
                }
            }
        }

        private static void ValidateSmtpConfiguration(
            SmtpEmailSetting smtpSetting)
        {
            if (string.IsNullOrWhiteSpace(smtpSetting.Host))
            {
                throw new InvalidOperationException(
                    "SMTP host is not configured.");
            }

            if (smtpSetting.Port <= 0)
            {
                throw new InvalidOperationException(
                    "SMTP port is not configured correctly.");
            }

            if (string.IsNullOrWhiteSpace(smtpSetting.UserName))
            {
                throw new InvalidOperationException(
                    "SMTP username is not configured.");
            }
        }
    }
}