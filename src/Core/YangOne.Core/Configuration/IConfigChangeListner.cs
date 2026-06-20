// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Configuration
{
/// <summary>
/// Defines a listener that reacts to configuration changes.
/// </summary>
public interface IConfigChangeListener
    {
        Task<bool> Update();
    }
}
