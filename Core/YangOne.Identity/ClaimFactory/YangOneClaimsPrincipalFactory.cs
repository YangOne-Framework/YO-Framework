using System.Security.Claims;
using YangOne.Identity.Model;
using YangOne.Identity.Service;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.DependencyInjection;
using YangOne.Web;

namespace YangOne.Identity.ClaimFactory
{

    public class YangOneClaimsPrincipalFactory<TUser, TRole> : UserClaimsPrincipalFactory<TUser, TRole>
       where TUser : class
       where TRole : class
    {
        public YangOneClaimsPrincipalFactory(UserManager<TUser> userManager, RoleManager<TRole> roleManager, IOptions<IdentityOptions> optionsAccessor) : base(userManager, roleManager, optionsAccessor)
        {
        }

        public async override Task<ClaimsPrincipal> CreateAsync(TUser user)
        {
            try
            {
                var principal = await base.CreateAsync(user);
                var identity = principal.Identities.First();

                if (!identity.HasClaim(x => x.Type == "sub"))
                {
                    var sub = await UserManager.GetUserIdAsync(user);
                    identity.AddClaim(new Claim("sub", sub));
                }

                var username = await UserManager.GetUserNameAsync(user);
                var appUserService = ContextResolver.Context.RequestServices.GetService<IAppUserService>();
                var appUser = await appUserService.AppUserCrudService.GetAsync("Where Email=@Email", new { Email = username });
                appUser = appUser ?? new AppUser();
                var usernameClaim = identity.FindFirst(claim => claim.Type == UserManager.Options.ClaimsIdentity.UserNameClaimType && claim.Value == username);
                if (usernameClaim != null)
                {
                    identity.RemoveClaim(usernameClaim);
                    identity.AddClaim(new Claim("username", username));
                    var userId = await UserManager.GetUserIdAsync(user);

                    identity.AddClaim(new Claim("IdUid", userId));
                    //TODO:: assign app user id
                    // identity.AddClaim(new Claim("appuserid", appUser.AppUserId.ToString()));
                    identity.AddClaim(new Claim("picture", appUser.ProfilePicture ?? "#"));
                    identity.AddClaim(new Claim("fn", $"{appUser.FirstName} {appUser.LastName}"));
                }
                //adding platform ie web mobile desktop pos 
                //identity.AddClaim(new Claim("channel", "web"));
                //var currentIdp = context.Subject.GetIdentityProvider();
                
                if (!identity.HasClaim(x => x.Type == "name"))
                {
                    identity.AddClaim(new Claim("name", username));
                }
                if (!identity.HasClaim(x => x.Type == ClaimTypes.Name))
                {
                    identity.AddClaim(new Claim(ClaimTypes.Name, username));
                }
                if (!identity.HasClaim(x => x.Type == "role"))
                {
                    var roles = await UserManager.GetRolesAsync(user);
                    foreach (var role in roles)
                    {
                        identity.AddClaim(new Claim("role", role));
                    }

                }
                if (UserManager.SupportsUserEmail)
                {
                    var email = await UserManager.GetEmailAsync(user);
                    if (!String.IsNullOrWhiteSpace(email))
                    {
                        identity.AddClaims(new[]
                        {
                        new Claim("email", email),
                        new Claim("email_verified",
                            await UserManager.IsEmailConfirmedAsync(user) ? "true" : "false", ClaimValueTypes.Boolean)
                    });
                    }
                }

                if (UserManager.SupportsUserPhoneNumber)
                {
                    var phoneNumber = await UserManager.GetPhoneNumberAsync(user);
                    if (!String.IsNullOrWhiteSpace(phoneNumber))
                    {
                        identity.AddClaims(new[]
                        {
                        new Claim("phone_number", phoneNumber),
                        new Claim("phone_number_verified",
                            await UserManager.IsPhoneNumberConfirmedAsync(user) ? "true" : "false", ClaimValueTypes.Boolean)
                    });
                    }
                }

                return principal;                
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }
        }
    }




}