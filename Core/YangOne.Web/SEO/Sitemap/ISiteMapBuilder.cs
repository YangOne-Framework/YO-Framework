namespace YangOne.Web
{
    public interface ISiteMapBuilder
    {
        IEnumerable<SitemapNode> Build();
    }
}