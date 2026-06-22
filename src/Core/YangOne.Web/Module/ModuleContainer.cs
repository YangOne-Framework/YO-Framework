// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;

namespace YangOne.Web.Module
{

    public class ModuleContainer
    {
        private readonly ReaderWriterLockSlim _lock = new();
        private readonly List<IModule> _modules;

        public ModuleContainer(IEnumerable<IModule> modules)
        {
            _modules = modules.ToList();
        }

        public IList<IModule> Modules
        {
            get
            {
                _lock.EnterReadLock();
                try
                {
                    return new List<IModule>(_modules);
                }
                finally
                {
                    _lock.ExitReadLock();
                }
            }
        }

        public void AddOrUpdate(IModule module)
        {
            _lock.EnterWriteLock();
            try
            {
                var existing = _modules.FirstOrDefault(x => x.Name.Equals(module.Name, StringComparison.OrdinalIgnoreCase));
                if (existing != null)
                    _modules.Remove(existing);

                _modules.Add(module);
            }
            finally
            {
                _lock.ExitWriteLock();
            }
        }

        public bool Remove(string moduleName)
        {
            _lock.EnterWriteLock();
            try
            {
                var existing = _modules.FirstOrDefault(x => x.Name.Equals(moduleName, StringComparison.OrdinalIgnoreCase));
                if (existing == null)
                    return false;

                return _modules.Remove(existing);
            }
            finally
            {
                _lock.ExitWriteLock();
            }
        }
    }
}
