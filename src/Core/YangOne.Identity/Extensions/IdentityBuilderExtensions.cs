// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
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

