using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting.Internal;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;

namespace YangOne.Security
{
    public class SecurityHeadersMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly SecurityHeadersPolicy _policy;
        private readonly ICspNonceService _cspNonceService;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private CspConfig _cachedConfig = null;
        private DateTime _lastConfigLoadTime = DateTime.MinValue;
        private readonly TimeSpan _configRefreshInterval = TimeSpan.FromSeconds(60);
        private readonly object _configLock = new object();

        public SecurityHeadersMiddleware(RequestDelegate next,
            SecurityHeadersPolicy policy, 
            ICspNonceService cspNonceService,IWebHostEnvironment webHostEnvironment)
        {
            _next = next;
            _policy = policy;
            _cspNonceService = cspNonceService;
            _webHostEnvironment = webHostEnvironment;
        }

        public async Task Invoke(HttpContext context)
        {
            //CspConfig cspConfig;
            //lock (_configLock)
            //{
            //    if (_cachedConfig == null || (DateTime.UtcNow - _lastConfigLoadTime) > _configRefreshInterval)
            //    {
            //        _cachedConfig = CspConfigLoader.Load(
            //            Path.Combine(_webHostEnvironment.ContentRootPath, "app_data", "cspconfig.json")
            //        );
            //        _lastConfigLoadTime = DateTime.UtcNow;
            //    }
            //    cspConfig = _cachedConfig;
            //}

            //if (cspConfig != null)
            //    _policy.CspBuiilder.ApplyConfig(cspConfig);

            //IHeaderDictionary headers = context.Response.Headers;
            //if (_policy.AddNonce)
            //{
            //    context.Response.Headers["Content-Security-Policy"] = _policy.CspBuiilder.Build(_cspNonceService);
            //}
            //else
            //{
            //    context.Response.Headers["Content-Security-Policy"] = _policy.CspBuiilder.Build();
            //}
            
            //foreach (var headerValuePair in _policy.SetHeaders)
            //{
            //    headers[headerValuePair.Key] = headerValuePair.Value;
            //}

            //foreach (var header in _policy.RemoveHeaders)
            //{
            //    headers.Remove(header);
            //}

            await _next(context);
        }
    }
}