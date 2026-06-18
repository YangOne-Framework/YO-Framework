// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Messaging
{
    /// <summary>
    /// Defines a publisher that can publish messages to subscribers.
    /// </summary>
    public interface IPublisher
    {
        Task Publish();
        Task Publish<T>(T message);
    }
}
