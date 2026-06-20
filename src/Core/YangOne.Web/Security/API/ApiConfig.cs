// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Security.API
{
    /// <summary>
    /// Configuration for API security (encryption/obfuscation).
    /// </summary>
    public class ApiConfig
    {
        public bool UseEncryption { get; set; }
        public bool UseObfusication { get; set; }
        public string ObfuscationKey { get; set; }
        public string EncryptionKey { get; set; }
        public string EncryptionIV { get; set; }    
    }
}

