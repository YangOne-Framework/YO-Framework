using System;
using YangOne.Identity.ClaimFactory;
using YangOne.Identity.Cryptography;
using YangOne.Identity.Model;
using YangOne.Identity.Service;
using YangOne.Identity.Stores;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace YangOne.Identity.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection ConfigureIdentityCryptography(this IServiceCollection services, IConfigurationSection configuration)
        {
            services.Configure<AESKeys>(configuration);
            services.AddSingleton<EncryptionHelper>();
            return services;
        }

        public static IdentityBuilder UseDapperWithSqlServer(this IdentityBuilder builder)
        {

            UseYangOneIdentityStores(builder.Services, builder.UserType, builder.RoleType);

            return builder;
        }

        public static IdentityBuilder UseDapperWithSqlServer<TKey>(this IdentityBuilder builder)
        {

            UseYangOneIdentityStores(builder.Services, builder.UserType, builder.RoleType, typeof(TKey));

            return builder;
        }


        public static IdentityBuilder UseDapperWithSqlServer<TKey, TUserRole, TRoleClaim>(this IdentityBuilder builder)
        {
           
            UseYangOneIdentityStores(builder.Services, builder.UserType, builder.RoleType, typeof(TKey), typeof(TUserRole), typeof(TRoleClaim));

            return builder;
        }
       

        private static void UseYangOneIdentityStores(IServiceCollection services, Type userType, Type roleType, Type keyType = null, Type userRoleType = null, Type roleClaimType = null, Type userClaimType = null, Type userLoginType = null)
        {
            keyType = keyType ?? typeof(int);
            userRoleType = userRoleType ?? typeof(YangOneIdentityUserRole<>).MakeGenericType(keyType);
            roleClaimType = roleClaimType ?? typeof(YangOneIdentityRoleClaim<>).MakeGenericType(keyType);
            userClaimType = userClaimType ?? typeof(YangOneIdentityUserClaim<>).MakeGenericType(keyType);
            userLoginType = userLoginType ?? typeof(YangOneIdentityUserLogin<>).MakeGenericType(keyType);

            var userStoreType = typeof(KachuwaUserStore<,,,,,,>).MakeGenericType(userType, keyType, userRoleType, roleClaimType,
                userClaimType, userLoginType, roleType);
            var roleStoreType = typeof(KachuwaRoleStore<,,,>).MakeGenericType(roleType, keyType, userRoleType, roleClaimType);
            
            services.AddScoped<IIdentityRoleService, IdentityRoleService>();
            services.AddScoped<IIdentityUserService, IdentityUserService>();
            services.AddScoped(typeof(IUserStore<>).MakeGenericType(userType), userStoreType);
            services.AddScoped(typeof(IRoleStore<>).MakeGenericType(roleType), roleStoreType);
           
        }

        public static IServiceCollection AddIdentityServerUserClaimsPrincipalFactory<TUser, TRole>(this IServiceCollection services)
          where TUser : class
          where TRole : class
        {
            return services.AddTransient<IUserClaimsPrincipalFactory<TUser>, YangOneClaimsPrincipalFactory<TUser, TRole>>();
        }


    }
}
