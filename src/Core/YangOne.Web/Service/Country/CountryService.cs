// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Data;
using YangOne.Web.Model;

namespace YangOne.Web.Services
{
    public class CountryService : ICountryService {
        public CrudService<Country> CountryCrudService { get; set; }=new CrudService<Country>();
    }
}
