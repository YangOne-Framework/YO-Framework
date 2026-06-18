// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Collections.Generic;

namespace YangOne.Log
{
    /// <summary>
    /// Represents a collection of log entries for a given day.
    /// </summary>
    public class DailyLog
    {
        public List<Log> Logs { get; set; }
        public int TotalCount { get; set; }
    }
}
