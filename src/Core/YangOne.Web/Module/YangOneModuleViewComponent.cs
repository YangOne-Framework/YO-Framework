// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Module
{
   
    /// <summary>
    /// Base class for view components that belong to a module.
    /// </summary>
    public abstract class YangOneModuleViewComponent<T> : YangOneViewComponent where T : IModule, new()
    {
        public readonly IModuleManager ModuleManager;
        public IModule Module;
        protected YangOneModuleViewComponent(IModuleManager moduleManager)
        {
            ModuleManager = moduleManager;
            Module = ModuleManager.Find(new T().Name);
            checkIfInstalled();

        }

        private void checkIfInstalled()
        {
            if(!Module.IsInstalled)
                throw  new Exception("Module is not installed");
        }

    }
}
