// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Module
{
    /// <summary>
    /// Defines a provider for module view components.
    /// </summary>
    public interface IModuleComponentProvider
    {
        Dictionary<string, List<ModuleComponentDescription>> GetComponents();
        IEnumerable<ModuleComponentDescription> GetComponents(string moduleName);

    }
}
