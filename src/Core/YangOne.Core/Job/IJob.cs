// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Threading.Tasks;

namespace YangOne.Job
{
    /// <summary>
    /// Defines the contract for a background job that can be executed by any provider.
    /// </summary>
    public interface IJob
    {
        /// <summary>
        /// Executes the job with the given context.
        /// </summary>
        Task<JobResult> ExecuteAsync(JobContext context);
    }
}
