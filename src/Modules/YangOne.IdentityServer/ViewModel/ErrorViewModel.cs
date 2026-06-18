// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace  YangOne.IdentityServer.ViewModel
{
    /// <summary>
    /// Represents a class ErrorViewModel.
    /// </summary>
    public class ErrorViewModel
    {
        public string? RequestId { get; set; }

        public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);
    }


    //public class ApiResourceViewModel
    //{
    //    public string Id { get; set; }

    //    [Required]
    //    [Display(Name = "Name (without 'rs_' prefix)")]
    //    public string Name { get; set; }

    //    [Display(Name = "Display Name")]
    //    public string DisplayName { get; set; }

    //    [Display(Name = "Description")]
    //    public string Description { get; set; }
    //}

    //public class ApiScopeViewModel
    //{
    //    public string Id { get; set; }

    //    [Required]
    //    [Display(Name = "Name (without 'api_' prefix)")]
    //    public string Name { get; set; }

    //    [Display(Name = "Display Name")]
    //    public string DisplayName { get; set; }

    //    [Display(Name = "Description")]
    //    public string Description { get; set; }
    //}
}

