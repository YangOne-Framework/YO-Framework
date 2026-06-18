// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;
using System.Collections.Generic;
using System.Text;

namespace YangOne.Caching
{
    /// <summary>
    /// Provides predefined cache duration constants (Short, Medium, Long).
    /// </summary>
    public static class CacheSetting
    {
        public static int ShortDuration { get; } = 60; //seconds 
        public static int MediumDuration { get; } = 1200;//seconds
        public static int LongDuration { get; } = 3600;//seconds
    }
}

