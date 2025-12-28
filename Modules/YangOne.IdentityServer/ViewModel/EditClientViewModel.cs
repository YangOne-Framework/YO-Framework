namespace YangOne.IdentityServer.ViewModel;

public class EditClientViewModel : CreateClientViewModel
{
    public string Id { get; set; }
    public bool IsConfidential { get; set; }
}