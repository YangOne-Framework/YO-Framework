// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Localization
{
    public class LocaleSetting
    {
        public string JsonResourceFileFormat = "locale-{0}.locale";//0=>culture
        public bool UseDbResources { get; set; } = true;
        public bool UseJsonResources { get; set; } = false;
        public bool UseXmlResources { get; set; } = false;
    }
}
