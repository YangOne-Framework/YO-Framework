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
            Modules = modules.ToList();
        }
        public IList<IModule> Modules { get; private set; }

        public void AddOrUpdate(IModule module)
        {
            var existing = Modules.FirstOrDefault(x => x.Name.Equals(module.Name, StringComparison.OrdinalIgnoreCase));
            if (existing != null)
                Modules.Remove(existing);

            Modules.Add(module);
        }
    }
}
