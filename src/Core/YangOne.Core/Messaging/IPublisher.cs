namespace YangOne.Messaging
{
    public interface IPublisher
    {
        Task Publish();
        Task Publish<T>(T message);
    }
}