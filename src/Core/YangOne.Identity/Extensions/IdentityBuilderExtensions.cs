using YangOne.Identity.ClaimFactory;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace YangOne.Identity.Extensions

{
    public static class IdentityServerIdentityBuilderExtensions
    {
        public static IdentityBuilder AddUserClaimsPrincipalFactory(this IdentityBuilder builder)
        {
            var interfaceType = typeof(IUserClaimsPrincipalFactory<>);
            interfaceType = interfaceType.MakeGenericType(builder.UserType);

            var classType = typeof(YangOneClaimsPrincipalFactory<,>);
            classType = classType.MakeGenericType(builder.UserType, builder.RoleType);

            builder.Services.AddScoped(interfaceType, classType);

            return builder;
        }
    }
}
