// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Data;

namespace YangOne.RTC
{
    public interface IRTCUserService: IRTCConnectionManager
    {
        CrudService<RTCUser> CrudService { get; set; }

    }
}
