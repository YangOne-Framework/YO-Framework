using System.Diagnostics;
using System.Diagnostics.Metrics;

namespace YangOne.Diagnostics
{
    public class ActivitySourceProvider : IDisposable
    {
        public ActivitySource ActivitySource { get; }
        public Meter Meter { get; }

        public ActivitySourceProvider()
        {
            ActivitySource = new ActivitySource(
                YODiagnostics.ActivitySourceName,
                YODiagnostics.ServiceVersion);

            Meter = new Meter(
                YODiagnostics.MeterName,
                YODiagnostics.ServiceVersion);
        }

        public void Dispose()
        {
            ActivitySource?.Dispose();
            Meter?.Dispose();
        }
    }
}
