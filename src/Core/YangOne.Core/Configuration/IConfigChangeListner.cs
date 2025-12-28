namespace YangOne.Configuration
{
    public interface IConfigChangeListner
    {
        Task<bool> Update();
    }
}