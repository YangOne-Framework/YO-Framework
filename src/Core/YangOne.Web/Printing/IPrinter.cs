namespace YangOne.Web.Printing
{
    public interface IPrinter
    {
        string Name { get; set; }
        void Print(string ipAddress, int port, IList<string> linesToPrint);
    }
}