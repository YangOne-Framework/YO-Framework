using System;
using System.Collections.Generic;

namespace YangOne.IdentityServer.ViewModel;

public class GrantViewModel
{
    public string Id { get; set; }
    public string Subject { get; set; }
    public string ApplicationName { get; set; }
    public DateTimeOffset? CreationDate { get; set; }
    public string Status { get; set; }
    public List<string> Scopes { get; set; } = new List<string>();
}