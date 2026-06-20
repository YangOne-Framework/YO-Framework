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

        Task SendEmailAsync(
            string subject,
            string message,
            params EmailAddress[] recipients);

        Task SendEmailWithAttachmentAsync(
            string subject,
            string message,
            string[] attachmentFiles,
            params EmailAddress[] recipients);

        Task SendTemplatedEmailAsync<TContext>(
            string subject,
            string templateKey,
            TContext context,
            params EmailAddress[] recipients);

        Task SendTemplatedEmailWithAttachmentAsync<TContext>(
            string subject,
            string templateKey,
            TContext context,
            string[] attachmentFiles,
            params EmailAddress[] recipients);
    }


}
