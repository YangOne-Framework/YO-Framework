// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;
using System.Collections.Generic;
using System.Linq;

namespace YangOne.Identity.Web.ViewModel
{
    /// <summary>
    /// Represents a class LoginViewModel.
    /// </summary>
    public class LoginViewModel : LoginInputModel
    {
        public bool AllowRememberLogin { get; set; } = true;
       
    }
}
