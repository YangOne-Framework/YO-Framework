// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Messaging
{
    /// <summary>
    /// Defines a subscriber that can unsubscribe from message publications.
    /// </summary>
    public interface ISubscriber
    {
        //Task<Guid> Register(IMessageHub hub);
        Task<bool> Unsubscribe();
    }
}
