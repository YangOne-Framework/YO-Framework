namespace YangOne.Web.Service
{
    public interface IExportService
    {
        Task<HttpResponseMessage> Export<T>(List<T> dataSources, string fileName, string sheetName);
    }
}