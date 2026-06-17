// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Security
{
    public interface ICspNonceService
    {
        /// <summary>
        /// Gets the generated nonce.
        /// </summary>
        /// <returns>Nonce generated when the service was initialized.
        /// Must be attached to CSP header and any inline style or script
        /// you want to use.</returns>
        string GetNonce();

        void GenerateNew();
    }
}
