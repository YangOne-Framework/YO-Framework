using YangOne.Data;
using YangOne.Web.Model;

namespace YangOne.Web.Services
{
    public class CountryService : ICountryService {
        public CrudService<Country> CountryCrudService { get; set; }=new CrudService<Country>();
    }
}