// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;
using Hangfire;
using Hangfire.Server;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Quartz;
using YangOne.BackgroundJobRunner.Hangfire;
using YangOne.BackgroundJobRunner.Quartz;
using YangOne.DI;
using YangOne.Job;

namespace YangOne.BackgroundJobRunner
{
    public enum BackgroundJobProvider
    {
        Hangfire,
        Quartz
    }

    public class BackgroundJobRunnerOptions
    {
        public BackgroundJobProvider Provider { get; set; } = BackgroundJobProvider.Hangfire;
        public string HangfireConnectionString { get; set; }
        public bool HangfireUseInMemoryStorage { get; set; } = true;
        public string QuartzSchedulerName { get; set; } = "YangOneQuartzScheduler";
        public string QuartzConnectionString { get; set; }
        public bool QuartzAutoStart { get; set; } = true;
        public int WorkerCount { get; set; } = Environment.ProcessorCount * 2;
    }

    public static class ServiceRegistrar
    {
        public static IServiceCollection AddYangOneBackgroundJobs(
            this IServiceCollection services,
            Action<BackgroundJobRunnerOptions> configure = null)
        {
            var options = new BackgroundJobRunnerOptions();
            configure?.Invoke(options);

            services.AddSingleton(options);

            switch (options.Provider)
            {
                case BackgroundJobProvider.Hangfire:
                    RegisterHangfire(services, options);
                    break;
                case BackgroundJobProvider.Quartz:
                    RegisterQuartz(services, options);
                    break;
                default:
                    throw new ArgumentOutOfRangeException(nameof(options.Provider));
            }

            return services;
        }

        private static void RegisterHangfire(IServiceCollection services, BackgroundJobRunnerOptions options)
        {
            if (options.HangfireUseInMemoryStorage)
            {
                services.AddHangfire(config =>
                    config.UseInMemoryStorage());
            }
            else if (!string.IsNullOrEmpty(options.HangfireConnectionString))
            {
                services.AddHangfire(config =>
                    config.UseSqlServerStorage(options.HangfireConnectionString,
                        new global::Hangfire.SqlServer.SqlServerStorageOptions
                        {
                            QueuePollInterval = TimeSpan.FromSeconds(15),
                            SlidingInvisibilityTimeout = TimeSpan.FromMinutes(30),
                            PrepareSchemaIfNecessary = true
                        }));
            }
            else
            {
                services.AddHangfire(config =>
                    config.UseInMemoryStorage());
            }

            services.AddHangfireServer(hfs =>
            {
                hfs.WorkerCount = options.WorkerCount;
                hfs.SchedulePollingInterval = TimeSpan.FromSeconds(15);
            });

            services.TryAddSingleton<IJobRunner, HangfireJobRunner>();
            services.TryAddSingleton<IRecurringJobScheduler, HangfireRecurringJobScheduler>();
            services.TryAddSingleton<IJobEngine, HangfireJobEngine>();
            services.TryAddSingleton<IJobManager, HangfireJobManager>();
        }

        private static void RegisterQuartz(IServiceCollection services, BackgroundJobRunnerOptions options)
        {
            services.AddQuartz(q =>
            {
                q.SchedulerName = options.QuartzSchedulerName;
                q.SchedulerId = "AUTO";

                if (!string.IsNullOrEmpty(options.QuartzConnectionString))
                {
                    q.UsePersistentStore(store =>
                    {
                        store.UseSqlServer(sqlServer =>
                        {
                            sqlServer.ConnectionString = options.QuartzConnectionString;
                        });
                        store.UseClustering();
                        store.PerformSchemaValidation = true;
                    });
                }
                else
                {
                    q.UseInMemoryStore();
                }

                q.UseSimpleTypeLoader();
                q.UseDefaultThreadPool(tp => tp.MaxConcurrency = options.WorkerCount);
            });

            if (options.QuartzAutoStart)
            {
                services.AddQuartzHostedService(qs => qs.WaitForJobsToComplete = true);
            }

            services.TryAddSingleton<IJobRunner, QuartzJobRunner>();
            services.TryAddSingleton<IRecurringJobScheduler, QuartzRecurringJobScheduler>();
            services.TryAddSingleton<IJobEngine, QuartzJobEngine>();
            services.TryAddSingleton<IJobManager, QuartzJobManager>();
        }
    }
}
