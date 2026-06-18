// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Diagnostics;
using System.Diagnostics.Metrics;

namespace YangOne.Diagnostics
{
    /// <summary>
    /// Provides ActivitySource and Meter instances for OpenTelemetry.
    /// </summary>
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

