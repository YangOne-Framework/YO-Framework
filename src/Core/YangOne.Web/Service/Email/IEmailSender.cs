// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Services
{
    /// <summary>
    /// Defines the contract for sending email messages.
    /// </summary>
    public interface IEmailSender
    {
        string Name { get; }
        Task SendEmailAsync(string subject, string message, params EmailAddress[] to);

        Task SendEmailAsync(EmailAddress from, string subject, string message, params EmailAddress[] to);

        Task SendTemplatedEmailAsync<T>(string subject, string templateKey, T context, params EmailAddress[] to);

        Task SendTemplatedEmailWithAttachmentAsync<T>(string subject, string templateKey, T context, string[] files, params EmailAddress[] to);

        Task SendTemplatedEmailAsync<T>(EmailAddress from, string subject, string templateKey, T context, params EmailAddress[] to);
        Task SendEmailTemplateAsync<T>(string subject, string template, T context, params EmailAddress[] to);
    }

   
}
