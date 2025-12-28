using System.Collections.Concurrent;

namespace YangOne.Security
{
    public class ContentSecurityPolicyBuiilder
    {
        private IDictionary<string,string> CspPolicies=new ConcurrentDictionary<string, string>();
        public bool SupportNonce { get; set; } = false;
        public ContentSecurityPolicyBuiilder AddScriptPolicy()
        {
            return this;
        }
        public ContentSecurityPolicyBuiilder AddScriptPolicy(Action<ScriptPolicyBuilder> builder)
        {
            var scripPolicyBuilder = new ScriptPolicyBuilder();
            builder(scripPolicyBuilder);
            SupportNonce = scripPolicyBuilder.SupportNonce;
            var values= scripPolicyBuilder.Build();
            if (!CspPolicies.ContainsKey(values[0]))
            {
                CspPolicies.Add(values[0], values[1]);
            }

            return this;
        }
        public ContentSecurityPolicyBuiilder AddStylePolicy(Action<StylePolicyBuilder> builder)
        {
            var policyBuilder = new StylePolicyBuilder();
            builder(policyBuilder);
            SupportNonce = policyBuilder.SupportNonce;
            var values = policyBuilder.Build();
            if (!CspPolicies.ContainsKey(values[0]))
            {
                CspPolicies.Add(values[0], values[1]);
            }

            return this;
        }
        public ContentSecurityPolicyBuiilder AddObjectPolicy(Action<ObjectPolicyBuilder> builder)
        {
            var policyBuilder = new ObjectPolicyBuilder();
            builder(policyBuilder);
            var values = policyBuilder.Build();
            if (!CspPolicies.ContainsKey(values[0]))
            {
                CspPolicies.Add(values[0], values[1]);
            }

            return this;
        }
        public ContentSecurityPolicyBuiilder AddDefaultPolicy(Action<DefaultPolicyBuilder> builder)
        {
            var policyBuilder = new DefaultPolicyBuilder();
            builder(policyBuilder);
            var values = policyBuilder.Build();
            if (!CspPolicies.ContainsKey(values[0]))
            {
                CspPolicies.Add(values[0], values[1]);
            }

            return this;
        }
        public ContentSecurityPolicyBuiilder AddImagePolicy(Action<ImagePolicyBuilder> builder)
        {
            var policyBuilder = new ImagePolicyBuilder();
            builder(policyBuilder);
            var values = policyBuilder.Build();
            if (!CspPolicies.ContainsKey(values[0]))
            {
                CspPolicies.Add(values[0], values[1]);
            }

            return this;
        }
        public ContentSecurityPolicyBuiilder AddMediaPolicy(Action<MediaPolicyBuilder> builder)
        {
            var policyBuilder = new MediaPolicyBuilder();
            builder(policyBuilder);
            var values = policyBuilder.Build();
            if (!CspPolicies.ContainsKey(values[0]))
            {
                CspPolicies.Add(values[0], values[1]);
            }

            return this;
        }
        public ContentSecurityPolicyBuiilder AddFramePolicy(Action<FramePolicyBuilder> builder)
        {
            var policyBuilder = new FramePolicyBuilder();
            builder(policyBuilder);
            var values = policyBuilder.Build();
            if (!CspPolicies.ContainsKey(values[0]))
            {
                CspPolicies.Add(values[0], values[1]);
            }

            return this;
        }
        public ContentSecurityPolicyBuiilder AddConnectPolicy(Action<ConnectPolicyBuilder> builder)
        {
            var policyBuilder = new ConnectPolicyBuilder();
            builder(policyBuilder);
            var values = policyBuilder.Build();
            if (!CspPolicies.ContainsKey(values[0]))
            {
                CspPolicies.Add(values[0], values[1]);
            }

            return this;
        }
        public ContentSecurityPolicyBuiilder AddFontPolicy(Action<FontPolicyBuilder> builder)
        {
            var policyBuilder = new FontPolicyBuilder();
            builder(policyBuilder);
            var values = policyBuilder.Build();
            if (!CspPolicies.ContainsKey(values[0]))
            {
                CspPolicies.Add(values[0], values[1]);
            }

            return this;
        }
        public ContentSecurityPolicyBuiilder AddBaseUriPolicy(Action<BaseUriPolicyBuilder> builder)
        {
            var policyBuilder = new BaseUriPolicyBuilder();
            builder(policyBuilder);
            var values = policyBuilder.Build();
            if (!CspPolicies.ContainsKey(values[0]))
            {
                CspPolicies.Add(values[0], values[1]);
            }

            return this;
        }
        public ContentSecurityPolicyBuiilder AddFormActionPolicy(Action<FormActionPolicyBuilder> builder)
        {
            var policyBuilder = new FormActionPolicyBuilder();
            builder(policyBuilder);
            var values = policyBuilder.Build();
            if (!CspPolicies.ContainsKey(values[0]))
            {
                CspPolicies.Add(values[0], values[1]);
            }

            return this;
        }
        public ContentSecurityPolicyBuiilder AddEmbedPolicy(Action<EmbedPolicyBuilder> builder)
        {
            var policyBuilder = new EmbedPolicyBuilder();
            builder(policyBuilder);
            var values = policyBuilder.Build();
            if (!CspPolicies.ContainsKey(values[0]))
            {
                CspPolicies.Add(values[0], values[1]);
            }

            return this;
        }
        public ContentSecurityPolicyBuiilder ApplyConfig(CspConfig config)
        {
            ClearPolicies();
            this.SupportNonce = config.SupportNonce;

            foreach (var directive in config.Directives)
            {
                switch (directive.Key)
                {
                    case "default-src":
                        this.AddDefaultPolicy(p => {
                            foreach (var v in directive.Value) p.PolicyValues.Add(v);
                        });
                        break;
                    case "script-src":
                        this.AddScriptPolicy(p => {
                            foreach (var v in directive.Value) p.PolicyValues.Add(v);
                            if (config.SupportNonce) p.AddNonce();
                        });
                        break;
                    case "style-src":
                        this.AddStylePolicy(p => {
                            foreach (var v in directive.Value) p.PolicyValues.Add(v);
                        });
                        break;
                    case "img-src":
                        this.AddImagePolicy(p => {
                            foreach (var v in directive.Value) p.PolicyValues.Add(v);
                        });
                        break;
                    case "object-src":
                        this.AddObjectPolicy(p => {
                            foreach (var v in directive.Value) p.PolicyValues.Add(v);
                        });
                        break;
                    case "media-src":
                        this.AddMediaPolicy(p => {
                            foreach (var v in directive.Value) p.PolicyValues.Add(v);
                        });
                        break;
                    case "frame-src":
                        this.AddFramePolicy(p => {
                            foreach (var v in directive.Value) p.PolicyValues.Add(v);
                        });
                        break;
                    case "connect-src":
                        this.AddConnectPolicy(p => {
                            foreach (var v in directive.Value) p.PolicyValues.Add(v);
                        });
                        break;
                    case "form-action":
                        this.AddFormActionPolicy(p => {
                            foreach (var v in directive.Value) p.PolicyValues.Add(v);
                        });
                        break;
                    case "embed-src":
                        this.AddEmbedPolicy(p => {
                            foreach (var v in directive.Value) p.PolicyValues.Add(v);
                        });
                        break;
                    case "font-src":
                        this.AddFontPolicy(p => {
                            foreach (var v in directive.Value) p.PolicyValues.Add(v);
                        });
                        break;
                    case "base-uri":
                        this.AddBaseUriPolicy(p => {
                            foreach (var v in directive.Value) p.PolicyValues.Add(v);
                        });
                        break;
                }
            }
            return this;
        }
        public void ClearPolicies()
        {
            CspPolicies.Clear();
            SupportNonce = false;
        }
        public string Build()
        {
            string cspContent = "";
            List<string> keyvalues = new List<string>();

          
            foreach (var key in CspPolicies.Keys)
            {
               
                    keyvalues.Add(key + " " + CspPolicies[key] + ";");
                
            }
            cspContent = String.Join(" ", keyvalues);
            return cspContent;
        }
        public string Build(ICspNonceService cspNonceService)
        {
            string cspContent = "";
            List<string> keyvalues = new List<string>();

            cspNonceService.GenerateNew();
            foreach (var key in CspPolicies.Keys)
            {
                if (key == "script-scr" || key == "style-src")
                {
                    keyvalues.Add(key + " "+ CspPolicies[key] +" 'nonce-" + cspNonceService.GetNonce() + "'" + ";");
                }
                else
                {
                    keyvalues.Add(key + " " + CspPolicies[key] + ";");
                }
            }
            cspContent = String.Join(" ", keyvalues);
            return cspContent;
        }

    }
}