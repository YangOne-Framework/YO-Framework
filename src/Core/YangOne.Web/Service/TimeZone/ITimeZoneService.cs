// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Data;
using YangOne.Web.Model;
namespace YangOne.Web.Service;
/// <summary>
/// Defines the contract for time zone management operations.
/// </summary>
public interface ITimeZoneService
{
    CrudService<Timezone> TimeZoneCrudService { get; set; }
    Task<Timezone> SaveUserTimeZone(long userId, int timeZoneId);
    Task<Timezone> CheckUserHasTimeZone(long userId);
    Task<IEnumerable<Timezone>> GetAllTimeZones();
}
