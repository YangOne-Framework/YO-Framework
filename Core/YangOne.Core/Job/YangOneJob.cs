using System;
using System.Linq.Expressions;

namespace YangOne.Job
{
    public class YangOneJob
    {
        public string JobName { get; set; }
        public Expression<Action> Job { get; set; }
        public string Cron { get; set; }
        public TimeSpan ScheduledTimeSpan { get; set; }
    }
}