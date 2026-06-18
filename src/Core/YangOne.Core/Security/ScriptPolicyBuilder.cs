// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Security
{
    /// <summary>
    /// Builder for the script-src CSP directive.
    /// </summary>
    public class ScriptPolicyBuilder:BasePolicyBuilder
    {
        public ScriptPolicyBuilder() : base("script-src")
        {
        }

       
    }
    /// <summary>
    /// Builder for the default-src CSP directive.
    /// </summary>
    public class DefaultPolicyBuilder : BasePolicyBuilder
    {
        public DefaultPolicyBuilder() : base("default-src")
        {
        }
    }
    /// <summary>
    /// Builder for the style-src CSP directive.
    /// </summary>
    public class StylePolicyBuilder : BasePolicyBuilder
    {
        public StylePolicyBuilder() : base("style-src")
        {
        }
    }
    /// <summary>
    /// Builder for the media-src CSP directive.
    /// </summary>
    public class MediaPolicyBuilder : BasePolicyBuilder
    {
        public MediaPolicyBuilder() : base("media-src")
        {
        }
    }
    /// <summary>
    /// Builder for the frame-src CSP directive.
    /// </summary>
    public class FramePolicyBuilder : BasePolicyBuilder
    {
        public FramePolicyBuilder() : base("frame-src")
        {
        }
    }
    
    /// <summary>
    /// Builder for the img-src CSP directive.
    /// </summary>
    public class ImagePolicyBuilder : BasePolicyBuilder
    {
        public ImagePolicyBuilder() : base("img-src")
        {
        }
    }
    /// <summary>
    /// Builder for the connect-src CSP directive.
    /// </summary>
    public class ConnectPolicyBuilder : BasePolicyBuilder
    {
        public ConnectPolicyBuilder() : base("connect-src")
        {
        }
    }
    /// <summary>
    /// Builder for the base-uri CSP directive.
    /// </summary>
    public class BaseUriPolicyBuilder : BasePolicyBuilder
    {
        public BaseUriPolicyBuilder() : base("base-uri")
        {
        }
    }
    /// <summary>
    /// Builder for the form-action CSP directive.
    /// </summary>
    public class FormActionPolicyBuilder : BasePolicyBuilder
    {
        public FormActionPolicyBuilder() : base("form-action")
        {
        }
    }
    /// <summary>
    /// Builder for the object-src CSP directive.
    /// </summary>
    public class ObjectPolicyBuilder : BasePolicyBuilder
    {
        public ObjectPolicyBuilder() : base("object-src")
        {
        }
    }
    /// <summary>
    /// Builder for the embed-src CSP directive.
    /// </summary>
    public class EmbedPolicyBuilder : BasePolicyBuilder
    {
        public EmbedPolicyBuilder() : base("embed-src")
        {
        }
    }
    /// <summary>
    /// Builder for the font-src CSP directive.
    /// </summary>
    public class FontPolicyBuilder : BasePolicyBuilder
    {
        public FontPolicyBuilder() : base("font-src")
        {
        }
    }
}
