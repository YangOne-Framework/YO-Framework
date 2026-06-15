using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace YangOne.Web.Security.API
{
    internal class Class1
    {
        //builder.Services.AddSingleton<ObfuscationService>(new ObfuscationService());
        //var services = builder.Services;
        //// Add encryption service with your secret key and IV
        //services.AddSingleton(new EncryptionService("u7x!A%D*G-KaPdSgVkYp3s6v9y$B?E(H+MbQeThWmZq4t7w!z%C*F)J@NcRfUjXn", "t6w9z$C&F)J@NcQf"));

        //services.AddControllersWithViews(options =>
        //{ // Clear all output formatters first
        //    options.OutputFormatters.Clear();
        //    options.OutputFormatters.Add(new EncryptedJsonFormatter(
        //        services.BuildServiceProvider().GetRequiredService<EncryptionService>()));
        //});
        ////app.UseMiddleware<ObfuscationMiddleware>();
    }

    public class ApiConfig
    {
        public bool UseEncryption { get; set; }
        public bool UseObfusication { get; set; }
        public string ObfuscationKey { get; set; }
        public string EncryptionKey { get; set; }
        public string EncryptionIV { get; set; }    
    }
    public interface IApiConfigService
    {
        Task<ApiConfig> GetConfigAsync();
        Task SaveConfigAsync(ApiConfig config);
    }
}
