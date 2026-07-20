// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.Extensions.DependencyInjection.Extensions;
using Scalar.AspNetCore;
using YOApp;
using YangOne.BackgroundJobRunner;
using YangOne.Configuration;
using YOApp;
using static OpenIddict.Abstractions.OpenIddictConstants.Permissions;

var builder = WebApplication.CreateBuilder(args);
// Add services to the container.
builder.Services.AddControllersWithViews();
// Add services to the container.
var env = builder.Environment;
var config = builder.Configuration;

config.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);
config.AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true, reloadOnChange: true);
config.AddJsonFile("app_data/yoconfig.json", optional: false, reloadOnChange: true);
config.AddJsonFile("app_data/securityconfig.json", optional: false, reloadOnChange: true);
config.AddJsonFile("app_data/cspconfig.json", optional: false, reloadOnChange: true);
config.AddJsonFile("app_data/optimizationconfig.json", optional: false, reloadOnChange: true);
config.AddJsonFile("app_data/fileconfig.json", optional: false, reloadOnChange: true);
config.AddJsonFile("app_data/apiconfig.json", optional: false, reloadOnChange: true);
config.AddJsonFile("app_data/cacheconfig.json", optional: true, reloadOnChange: true);

config.AddEnvironmentVariables();

builder.Services.TryAddSingleton<ConfigChangeEvent, YangOneConfigChangeEvent>();
Startup.ConfigureServices(builder.Services, config, env);

var isInstalled = config["YangOneAppConfig:IsInstalled"]?.ToLower() != "false";
if (isInstalled)
{
    builder.Services.AddYangOneBackgroundJobs(options =>
    {
        options.Provider = BackgroundJobProvider.Hangfire;
        options.HangfireConnectionString = builder.Configuration.GetConnectionString("JobConnection");
        options.HangfireUseInMemoryStorage = false;
        options.WorkerCount = Environment.ProcessorCount * 2;
    });
}

//builder.AddIdentityServer(builder.Configuration);
var app = builder.Build();

Startup.Configure(app, serviceProvider: builder.Services.BuildServiceProvider(), env);
//TODO::open api
//app.MapOpenApi();
app.MapOpenApi("/openapi/{documentName}.json").RequireAuthorization("ScalarBasicPolicy");

app.MapScalarApiReference(options => options
    .AddPreferredSecuritySchemes("OAuth")
    .AddOAuth2Flows("OAuth", flows =>
    {
        // Configure Authorization Code flow
        flows.AuthorizationCode = new AuthorizationCodeFlow
        {
            ClientId = "test-client"
        };

        // Configure Client Credentials flow
        flows.ClientCredentials = new ClientCredentialsFlow
        {
            ClientId = "test-client",
            ClientSecret = "test-secret"
        };
    })
    // All OAuth flows will have preselected scopes
    .AddDefaultScopes("OAuth", ["profile", "email"])
);
app.Run();