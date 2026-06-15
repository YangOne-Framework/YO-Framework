using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using YangOne.Diagnostics;

namespace YangOne.Web.Diagnostics
{
    public class YOOpenTelemetryOptions
    {
        public bool Enabled { get; set; } = true;
        public string OtlpEndpoint { get; set; } = "http://localhost:4317";
        public bool EnableConsoleExporter { get; set; } = false;
        public double TraceSamplingRate { get; set; } = 1.0;
        public bool EnableRuntimeInstrumentation { get; set; } = true;
        public bool EnableHttpClientInstrumentation { get; set; } = true;
        public bool EnableLogExport { get; set; } = false;
    }

    public static class YOOpenTelemetryExtensions
    {
        public static IServiceCollection AddYOOpenTelemetry(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            var otelOptions = configuration
                .GetSection("YOOpenTelemetry")
                .Get<YOOpenTelemetryOptions>() ?? new YOOpenTelemetryOptions();

            if (!otelOptions.Enabled)
                return services;

            var resourceBuilder = ResourceBuilder.CreateDefault()
                .AddService(
                    serviceName: YODiagnostics.ServiceName,
                    serviceVersion: YODiagnostics.ServiceVersion);

            services.AddOpenTelemetry()
                .ConfigureResource(r => r = resourceBuilder)
                .WithTracing(tracing =>
                {
                    tracing
                        .AddAspNetCoreInstrumentation()
                        .SetSampler(new AlwaysOnSampler());

                    if (otelOptions.EnableHttpClientInstrumentation)
                        tracing.AddHttpClientInstrumentation();

                    tracing.AddOtlpExporter(options =>
                    {
                        options.Endpoint = new Uri(otelOptions.OtlpEndpoint);
                    });

                    if (otelOptions.EnableConsoleExporter)
                        tracing.AddConsoleExporter();
                })
                .WithMetrics(metrics =>
                {
                    metrics
                        .AddAspNetCoreInstrumentation();

                    if (otelOptions.EnableHttpClientInstrumentation)
                        metrics.AddHttpClientInstrumentation();

                    if (otelOptions.EnableRuntimeInstrumentation)
                        metrics.AddRuntimeInstrumentation();

                    metrics.AddOtlpExporter(options =>
                    {
                        options.Endpoint = new Uri(otelOptions.OtlpEndpoint);
                    });

                    if (otelOptions.EnableConsoleExporter)
                        metrics.AddConsoleExporter();
                });

            if (otelOptions.EnableLogExport)
            {
                services.AddLogging(logging =>
                {
                    logging.AddOpenTelemetry(options =>
                    {
                        options.IncludeScopes = true;
                        options.ParseStateValues = true;
                        options.IncludeFormattedMessage = true;
                        options.AddOtlpExporter(otlpOptions =>
                        {
                            otlpOptions.Endpoint = new Uri(otelOptions.OtlpEndpoint);
                        });
                    });
                });
            }

            return services;
        }

        public static IApplicationBuilder UseYOOpenTelemetry(this IApplicationBuilder app)
        {
            return app;
        }
    }
}
