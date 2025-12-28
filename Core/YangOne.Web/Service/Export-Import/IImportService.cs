using Microsoft.AspNetCore.Http;

namespace YangOne.Web.Service
{
    public interface IImportService
    {
        List<T> Import<T>(IFormFile file);
        List<T> Import<T>(string filePath);
    }
}

    