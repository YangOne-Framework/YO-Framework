// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;

namespace YangOne.Data
{
    /// <summary>
    /// Provides a static access point for the current <see cref="IDatabaseFactory"/> instance.
    /// </summary>
    public static class DbFactoryProvider
    {
        private static IDatabaseFactory _currentDatabaseFactory;
        private static readonly object _lock = new();

        public static void SetCurrentDbFactory(IDatabaseFactory dbFactory)
        {
            lock (_lock)
            {
                _currentDatabaseFactory = dbFactory;
            }
        }

        public static IDatabaseFactory GetFactory()
        {
            lock (_lock)
            {
                if (_currentDatabaseFactory == null)
                    throw new InvalidOperationException("Database factory has not been initialized. Call SetCurrentDbFactory during startup.");
                return _currentDatabaseFactory;
            }
        }

    }
}
