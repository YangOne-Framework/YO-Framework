using System.Security.Claims;
using System.Security.Principal;
using Microsoft.AspNetCore.Http;
using YangOne.Web;

namespace YangOne.Identity.Extensions
{

    public static class IdentityExtensions
    {


        public static string GetSessionId(this IIdentity identity)
        {
            try
            {
                var _context = ContextResolver.Context;
                if (_context.User.Identity.IsAuthenticated)
                {

                    IEnumerable<Claim> claims = ((ClaimsIdentity)identity).Claims;
                    foreach (var claim in claims)
                    {
                        if (claim.Type == ApplicationClaim.SessionCode)
                            return claim.Value;
                    }

                }
                else
                {
                    var cookie = "";
                    _context.Request.Cookies.TryGetValue(ApplicationClaim.SessionCode, out cookie);
                    if (cookie != null)
                    {
                        return cookie;

                    }
                    else
                    {
                        var guid = Guid.NewGuid().ToString();


                        CookieOptions option = new CookieOptions
                        {
                            HttpOnly = true,
                            Expires = DateTime.Now.AddMinutes(20)
                        };


                        _context.Response.Cookies.Append(ApplicationClaim.SessionCode, guid, option);
                        return guid;
                    }
                }
                return "";
            }
            catch (Exception ex)
            {

                throw ex;
            }

        }
        public static long GetIdentityUserId(this IIdentity identity)
        {
            var claim = ((ClaimsIdentity)identity).FindFirst("IdUid");
            // Test for null to avoid issues during local testing
            return (claim != null) ? Convert.ToInt64(claim.Value) : 0;
        }
        public static string GetUserName(this IIdentity identity)
        {
            var claim = ((ClaimsIdentity)identity).FindFirst("name");
            return (claim != null) ? claim.Value : "";
        }
        public static IEnumerable<string> GetRoles(this IIdentity identity)
        {
            var roles = ((ClaimsIdentity)identity).Claims
                .Where(c => c.Type == "role" || c.Type == ClaimTypes.Role)
                .Select(c => c.Value);
            return roles;
        }
        public static string GetFullName(this IIdentity identity)
        {
            var fn = ((ClaimsIdentity)identity).FindFirst("fn");

            return (fn != null) ? fn.Value : "";
        }
        public static string GetPicture(this IIdentity identity)
        {
            var picture = ((ClaimsIdentity)identity).FindFirst("picture");

            return picture == null ? "" : picture.Value;
        }

        public static long GetAppUserUserId(this IIdentity identity)
        {
            //TODO: AppUser ID
            var claim = ((ClaimsIdentity)identity).FindFirst("appuserid");
            // Test for null to avoid issues during local testing
            return (claim != null) ? Convert.ToInt64(claim.Value) : 0;
        }

    }

}