// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Threading.Tasks;

namespace YangOne.Job
{
    public interface IYangOneJobEngineStarter
    {
        Task Start();
        Task Stop();
    }
}
