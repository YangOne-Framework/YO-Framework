namespace YangOne.Web
{
    public interface ISitemapProvider
    {
        string CreateSitemap(IEnumerable<SitemapNode> nodes);

    }
}