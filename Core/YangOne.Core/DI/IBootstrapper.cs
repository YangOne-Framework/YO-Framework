namespace YangOne.DI
{
    internal interface IBootstrapper
    {
        void Init();
        bool Build();
    }
}