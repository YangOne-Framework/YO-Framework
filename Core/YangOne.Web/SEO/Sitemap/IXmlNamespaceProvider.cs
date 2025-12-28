namespace YangOne.Web
{
    public interface IXmlNamespaceProvider
    {
        IEnumerable<string> GetNamespaces();
    }
}