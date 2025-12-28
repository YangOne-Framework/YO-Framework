namespace YangOne.Caching
{
    public interface ICacheProvider
    {
        ICacheService Get(string name);
    }
}