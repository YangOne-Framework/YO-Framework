using System;
using System.Collections.Generic;
using System.Linq;

namespace YangOne.Identity.Web.ViewModel
{
    public class LoginViewModel : LoginInputModel
    {
        public bool AllowRememberLogin { get; set; } = true;
       
    }
}