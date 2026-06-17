// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace YangOne.Job
{
    public interface IYangOneJobRunner
    {
        string Queue(Action job);
        string Queue(Expression<Action> job);
        string Queue(YangOneJob job);
        void Recurring(YangOneJob job);
        bool Remove(string jobId);
        string Schedule(YangOneJob job);
        bool Trigger(string jobId);
    }
}
