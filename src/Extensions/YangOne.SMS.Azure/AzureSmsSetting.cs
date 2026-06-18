// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace Azure.SMSSender
{
    /// <summary>
    /// Represents the configuration settings for Azure SMS service
    /// </summary>
    public class AzureSmsSetting
    {

        public string AccessKey { get; set; }
        public string FromNumber { get; set; }
    }
}
