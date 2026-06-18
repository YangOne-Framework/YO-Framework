// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Security
{
    /// <summary>
    /// Generates security tokens for anti-forgery and authorization.
    /// </summary>
    public interface ITokenGenerator
    {
        Task<object> Generate() ;
        string RequestAntiforgeryToken();
    }
}
