// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Module
{
    /// <summary>
    /// Holds the collection of registered modules.
    /// </summary>
    public class ModuleContainer
    {
        public ModuleContainer(IEnumerable<IModule> modules)
        {
            Modules = modules;
        }
        public IEnumerable<IModule> Modules { get; private set; }
    }
}
