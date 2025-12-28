using Microsoft.Extensions.DependencyInjection.Extensions;
using Scalar.AspNetCore;
using YOApp;
using YangOne.Configuration;
using YangOne.IdentityServer;

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





builder.Services.TryAddSingleton<ConfigChangeEvent, YangOneConfigChangeEvent>();
Startup.ConfigureServices(builder.Services, config, env);
//builder.AddIdentityServer(builder.Configuration);
var app = builder.Build();

Startup.Configure(app, serviceProvider: builder.Services.BuildServiceProvider(), env);
//TODO::open api
app.MapOpenApi();
app.MapScalarApiReference();
app.Run();