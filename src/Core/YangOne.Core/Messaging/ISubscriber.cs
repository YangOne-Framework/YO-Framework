namespace YangOne.Messaging
{
    public interface ISubscriber
    {
        //Task<Guid> Register(IMessageHub hub);
        Task<bool> Unsubscribe();
    }
}