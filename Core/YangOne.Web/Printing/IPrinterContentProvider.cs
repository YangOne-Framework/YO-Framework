namespace YangOne.Web.Printing
{
    public interface IPrinterContentProvider
    {
        IList<string> GetContent(IPrinter printer);
    }
}