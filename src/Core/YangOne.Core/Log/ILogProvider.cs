// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Log
{
    /// <summary>
    /// Represents a way to get a logs"/>
    /// </summary>
    public interface ILogProvider
    {
        ILogger GetLogger(string name);
    }
}
