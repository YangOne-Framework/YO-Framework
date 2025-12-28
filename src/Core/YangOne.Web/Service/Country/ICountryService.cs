using YangOne.Data;
using YangOne.Web.Model;

namespace YangOne.Web.Services
{
    public interface ICountryService
    {
        CrudService<Country> CountryCrudService { get; set; }
    }
}
