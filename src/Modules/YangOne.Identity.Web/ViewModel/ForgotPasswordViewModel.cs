// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.ComponentModel.DataAnnotations;

namespace YangOne.Identity.Web.ViewModel
{
    /// <summary>
    /// Represents a class ForgotPasswordViewModel.
    /// </summary>
    public class ForgotPasswordViewModel
    {
        [Required]
        public string EmailOrUserName { get; set; }
    }
}
