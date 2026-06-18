// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Data;
using YangOne.Web.Model;

namespace YangOne.Web.Services
{
    /// <summary>
    /// Defines the contract for country-related data operations.
    /// </summary>
    public interface ICountryService
    {
        CrudService<Country> CountryCrudService { get; set; }
    }
}

