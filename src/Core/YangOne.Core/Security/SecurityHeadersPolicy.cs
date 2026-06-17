// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Security
{
    public class SecurityHeadersPolicy
    {
        public IDictionary<string, string> SetHeaders { get; }
            = new Dictionary<string, string>();

        public ISet<string> RemoveHeaders { get; }
            = new HashSet<string>();

        public bool AddNonce { get; set; } = false;
        public ContentSecurityPolicyBuiilder CspBuiilder { get; set; }
    }
   
}
