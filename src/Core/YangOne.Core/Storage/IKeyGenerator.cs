namespace YangOne.Storage
{
    public interface IKeyGenerator
    {
        string GetKey();
        string GetKey(int size);
    }
}