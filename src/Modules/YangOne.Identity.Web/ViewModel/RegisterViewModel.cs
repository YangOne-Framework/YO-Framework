// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.ComponentModel.DataAnnotations;
using YangOne.Identity.Model;

namespace YangOne.Identity.Web.ViewModel
{
    public class RegisterViewModel:AppUser
    {
       

        [Required]
        [StringLength(100, ErrorMessage = "User.Password.Length", MinimumLength = 8)]
     
        public string Password { get; set; }
    
      
        [Compare("Password", ErrorMessage = "User.Password.NotMatched")]
        public string ConfirmPassword { get; set; }
    }
}
