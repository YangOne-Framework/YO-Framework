// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web
{
    /// <summary>
    /// Represents an email message with subject, body, sender, and recipient information.
    /// </summary>
    public class Email
    {
        public string Subject { get; set; }

        public string MessageText { get; set; }

        public string MessageHtml { get; set; }

        public EmailAddress[] To { get; set; }

        public EmailAddress From { get; set; }
    }
}

