// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.IdentityServer.ViewModel;

/// <summary>
/// Represents a class EditClientViewModel.
/// </summary>
public class EditClientViewModel : CreateClientViewModel
{
    public string Id { get; set; }
    public bool IsConfidential { get; set; }
}
