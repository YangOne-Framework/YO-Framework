namespace YangOne.Web.Module
{
   
    public abstract class YangOneModuleViewComponent<T> : YangOneViewComponent where T : IModule, new()
    {
        public readonly IModuleManager ModuleManager;
        public IModule Module;
        protected YangOneModuleViewComponent(IModuleManager moduleManager)
        {
            ModuleManager = moduleManager;
            Module = new T();
            Module = ModuleManager.FindAsync(Module.Name).GetAwaiter().GetResult();
            checkIfInstalled();

        }

        private void checkIfInstalled()
        {
            if(!Module.IsInstalled)
                throw  new Exception("Module is not installed");
        }

    }
}