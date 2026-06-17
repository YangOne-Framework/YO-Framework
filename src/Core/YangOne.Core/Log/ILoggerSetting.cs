// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Threading.Tasks;

namespace YangOne.Log
{
    public interface ILoggerSetting
    {
        bool AllowLogging { get; set; }
    }
}
