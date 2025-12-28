
using YangOne.OTP.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using YangOne.DI;
using YangOne.OTP.Service;

namespace YangOne.OTP
{
    public class OPTServiceRegistrar : IServiceRegistrar
    {
        public void Update(IServiceCollection serviceCollection)
        {
           
        }

        public void Register(IServiceCollection serviceCollection, IConfiguration configuration)
        {
            serviceCollection.TryAddSingleton<IOTPService, OTPService>();
        }
    }
}