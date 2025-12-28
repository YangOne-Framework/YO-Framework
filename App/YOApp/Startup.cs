
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using OpenIddict.Abstractions;
using OpenIddict.Server.AspNetCore;
using OpenIddict.Validation.AspNetCore;
using System.Security.Cryptography.X509Certificates;
using System.Threading.RateLimiting;
using OpenIddict.Server;
using YangOne.Data;
using YangOne.Data.Crud;
using YangOne.Extensions;
using YangOne.IdentityServer.Model;
using YangOne.IdentityServer.Service;
using YangOne.Web;
using YangOne.Web.API;
using YangOne.Web.Service;

namespace YOApp
{
    public class Startup
    {

        public static void ConfigureServices(IServiceCollection services, IConfiguration configuration, IWebHostEnvironment hostingEnvironment)
        {
            services.AddSingleton(configuration);
            var serviceProvider = services.BuildServiceProvider();
            //TODO can be used in Action Config in KachuwaSetup
            //registering default database factory service
            IDatabaseFactory dbFactory = DatabaseFactories.SetFactory(Dialect.SQLServer, serviceProvider);
            services.AddSingleton(dbFactory);
            services.RegisterKachuwaCoreServices(serviceProvider);
            services.AddControllers();

            services.AddSignalR(o =>
            {

                o.EnableDetailedErrors = true;
                o.ClientTimeoutInterval = TimeSpan.FromSeconds(60);

            }).AddJsonProtocol(options =>
            {
                options.PayloadSerializerOptions.PropertyNamingPolicy = null;//camel casing

            });

            services.AddScoped<IdentityServerApplicationStore>();
            services.AddScoped<IdentityServerAuthorizationStore>();
            services.AddScoped<IdentityServerScopeStore>();
            services.AddScoped<IdentityServerTokenStore>();
            var encryptionCert = new X509Certificate2(
                Path.Combine(hostingEnvironment.ContentRootPath, "app_data", "certs", "encryption.pfx"),
                "MyStrongPassword123!",
                X509KeyStorageFlags.MachineKeySet | X509KeyStorageFlags.EphemeralKeySet);
            services.AddOpenIddict()

                // Register the OpenIddict core components.
                .AddCore(options =>
                {
                    // Configure OpenIddict to use the Entity Framework Core stores and models.
                    // Note: call ReplaceDefaultEntities() to replace the default OpenIddict entities.
                    //  options.UseEntityFrameworkCore()
                    //   .UseDbContext<ApplicationDbContext>();

                    // options.ReplaceApplicationStore<IOpenI
                    // ddictApplicationStore<OpenIddictApplication>>(IOpenIddictApplicationStore<OpenIddictApplication>);

                    options.ReplaceApplicationStore<OpenIddictApplication, IdentityServerApplicationStore>();
                    options.ReplaceAuthorizationStore<OpenIddictAuthorization, IdentityServerAuthorizationStore>();
                    options.ReplaceScopeStore<OpenIddictScope, IdentityServerScopeStore>();
                    options.ReplaceTokenStore<OpenIddictToken, IdentityServerTokenStore>();

                    options.SetDefaultApplicationEntity<OpenIddictApplication>();
                    options.SetDefaultAuthorizationEntity<OpenIddictAuthorization>();
                    options.SetDefaultScopeEntity<OpenIddictScope>();
                    options.SetDefaultTokenEntity<OpenIddictToken>();

                })

                // Register the OpenIddict server components.
                .AddServer(options =>
                {
                    options.AddEventHandler<OpenIddictServerEvents.ProcessErrorContext>(builder =>
                        builder.UseInlineHandler(context =>
                        {
                            Console.WriteLine("OIDC ERROR: " + context.Error);
                            Console.WriteLine("OIDC DESC : " + context.ErrorDescription);
                            Console.WriteLine("OIDC URI  : " + context.ErrorUri);
                            return default;
                        }));

                    // optionally:
                    options.AddEventHandler<OpenIddictServerEvents.ValidateTokenRequestContext>(builder =>
                        builder.UseInlineHandler(context =>
                        {
                            Console.WriteLine("TOKEN REQUEST grant_type: " + context.Request.GrantType);
                            Console.WriteLine("TOKEN REQUEST client_id : " + context.Request.ClientId);
                            Console.WriteLine("TOKEN REQUEST redirect  : " + context.Request.RedirectUri);
                            return default;
                        }));
                    options.AddEventHandler<OpenIddictServerEvents.ValidateTokenContext>(builder =>
                        builder.UseInlineHandler(context =>
                        {
                            Console.WriteLine("Validating token: " + context.Token);
                            return default;
                        }));

                    options.AcceptAnonymousClients(); // public clients
                    options.SetAuthorizationEndpointUris("connect/authorize")
                        //.SetDeviceEndpointUris("connect/device")
                        .SetIntrospectionEndpointUris("connect/introspect")
                        .SetEndSessionEndpointUris("connect/logout")
                        .SetTokenEndpointUris("connect/token")
                        .SetUserInfoEndpointUris("connect/userinfo")
                        .SetEndUserVerificationEndpointUris("connect/verify");

                    options.AllowAuthorizationCodeFlow().AllowPasswordFlow()
                        .RequireProofKeyForCodeExchange() // If using PKCE
                        .SetAuthorizationCodeLifetime(TimeSpan.FromMinutes(5)) // Default is 5 minutes
                        .SetAccessTokenLifetime(TimeSpan.FromHours(1))
                        .AllowHybridFlow()
                        .AllowClientCredentialsFlow()
                        .AllowRefreshTokenFlow();
                 
                    // Register the signing and encryption credentials.
                    //options.AddDevelopmentEncryptionCertificate()
                    //    .AddDevelopmentSigningCertificate();


                    options.AddEncryptionCertificate(encryptionCert)

                        .AddSigningCertificate(encryptionCert);




                    // OPTIONAL but recommended if you want jwt.io-friendly tokens:
                    // don’t encrypt access tokens; make them plain JWS
                    options.DisableAccessTokenEncryption();

                    // Register the ASP.NET Core host and configure the ASP.NET Core-specific options.
                    options.UseAspNetCore()
                        .EnableAuthorizationEndpointPassthrough()
                        .EnableEndSessionEndpointPassthrough()
                        .EnableTokenEndpointPassthrough()
                        .EnableUserInfoEndpointPassthrough()
                        .EnableStatusCodePagesIntegration();
                    ;
                    options.RegisterScopes(
                        OpenIddictConstants.Scopes.OpenId,
                        OpenIddictConstants.Scopes.Email,
                        OpenIddictConstants.Scopes.Profile,
                        OpenIddictConstants.Scopes.OfflineAccess,
                        "api1"
                    );
                })

                // Register the OpenIddict validation components.
                .AddValidation(options =>
                {
                    // Import the configuration from the local OpenIddict server instance.
                    options.UseLocalServer();

                    // Register the ASP.NET Core host.
                    options.UseAspNetCore();
                });
            services.PostConfigureAll<OpenIddictServerAspNetCoreOptions>(options =>
            {
                options.DisableTransportSecurityRequirement = true;
                options.EnableStatusCodePagesIntegration = true;
            });
            var rateLimitConfig = configuration.GetSection("RateLimiting").Get<RateLimitOptions>();

            services.AddRateLimiter(options =>
            {
                options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
                {
                    var key = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                    return RateLimitPartition.GetTokenBucketLimiter(
                        partitionKey: key,
                        factory: _ => new TokenBucketRateLimiterOptions
                        {
                            TokenLimit = rateLimitConfig.TokenLimit,
                            TokensPerPeriod = rateLimitConfig.TokensPerPeriod,
                            ReplenishmentPeriod = TimeSpan.FromSeconds(rateLimitConfig.ReplenishmentSeconds),
                            AutoReplenishment = true,
                            QueueLimit = 0
                        });
                });
                // Named policy
                options.AddPolicy("StrictPolicy", httpContext =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                        _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = 3,
                            Window = TimeSpan.FromSeconds(10),
                            QueueLimit = 0
                        }));

                //options.AddPolicy("PremiumTier", context =>
                //    RateLimitPartition.GetFixedWindowLimiter(
                //        partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "premium",
                //        _ => new FixedWindowRateLimiterOptions
                //        {
                //            PermitLimit = 20,
                //            Window = TimeSpan.FromSeconds(10),
                //            QueueLimit = 0
                //        }));

                options.OnRejected = (context, token) =>
                {
                    context.HttpContext.Response.StatusCode = 429;
                    context.HttpContext.Response.WriteAsync("Rate limit exceeded");
                    return ValueTask.CompletedTask;

                };

            });
            //services.
            //AddOpenApi(options =>
            //{
            //    // Specify the OpenAPI version to use
            //    options.OpenApiVersion = Microsoft.OpenApi.OpenApiSpecVersion.OpenApi3_0;
            //});
            // OpenAPI + Scalar
            services.AddOpenApi(options =>
            { // Specify the OpenAPI version to use
                options.OpenApiVersion = Microsoft.OpenApi.OpenApiSpecVersion.OpenApi3_0;
                options.AddDocumentTransformer<BearerSecuritySchemeTransformer>();
            });
            //services.ConfigureApplicationCookie(options =>
            //{
            //    options.Cookie.Name = "yoidx";
            //    options.Cookie.
            //    options.LoginPath = new PathString("/account/login");
            //    options.AccessDeniedPath = new PathString("/access-denied");
            //    options.LogoutPath = new PathString("/account/logout");
            //    options.Cookie.SameSite = SameSiteMode.Lax;
            //    options.Cookie.HttpOnly = false;
            //    options.ExpireTimeSpan = TimeSpan.FromDays(30);


            //});
            services.AddAuthentication(options =>
            {
                options.DefaultScheme = "Cookies";
                options.DefaultAuthenticateScheme =
                    OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme =
                    OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme;

            })
                .AddCookie("Cookies").AddJwtBearer(opts =>
                {
                    opts.Authority = hostingEnvironment.IsDevelopment() ? "https://localhost:44314" : configuration["KachuwaAppConfig:TokenAuthority"];
                    opts.Audience = "aud";
                    opts.RequireHttpsMetadata = true;
                    opts.IncludeErrorDetails = true;
                    opts.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateAudience = false,
                        RoleClaimType = "role",//to support   [Authorize(Roles = "SuperUser")]

                    };

                    opts.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = ctx =>
                        {
                            // replace "token" with whatever your param name is
                            if (ctx.Request.Method.Equals("GET") && ctx.Request.Query.ContainsKey("token"))
                                ctx.Token = ctx.Request.Query["token"];
                            return Task.CompletedTask;
                        },
                        //OnChallenge = ctx =>
                        //{
                        //    // Tell the default handler we are taking over apiauthorize
                        //    ctx.HandleResponse();

                        //    ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        //    ctx.Response.ContentType = "application/json";

                        //    var payload = System.Text.Json.JsonSerializer.Serialize(
                        //        new { Code = 401, Message = "Unauthorized Request" });

                        //    return ctx.Response.WriteAsync(payload);
                        //}
                    };
                });



            services.AddAuthorization();
            services.Configure<IISServerOptions>(options =>
            {
                options.AllowSynchronousIO = true;
            });
            services.AddHsts(options =>
            {
                options.Preload = true;
                options.IncludeSubDomains = true;
                options.MaxAge = TimeSpan.FromDays(1);

            });
            services.AddHttpsRedirection(options =>
            {
                options.RedirectStatusCode = StatusCodes.Status308PermanentRedirect;
                options.HttpsPort = hostingEnvironment.IsDevelopment() ? 7152 : 443;
            });
            services.AddDistributedMemoryCache();

            services.AddSession(options =>
            {
                options.IdleTimeout = TimeSpan.FromMinutes(10);
                options.Cookie.HttpOnly = true;
                options.Cookie.IsEssential = true;
            });

            services.AddHttpContextAccessor();
            //services.AddAuthentication().AddGoogle(googleOptions =>
            //{
            //    googleOptions.ClientId = Configuration["Authentication:Google:ClientId"];
            //    googleOptions.ClientSecret = Configuration["Authentication:Google:ClientSecret"];
            //});
            //services.AddAuthentication().AddFacebook(facebookOptions =>
            //{
            //    facebookOptions.AppId = Configuration["Authentication:Facebook:AppId"];
            //    facebookOptions.AppSecret = Configuration["Authentication:Facebook:AppSecret"];
            //});
            //services.RegisterSchedulingServer(configuration);

            services.AddSignalR();

        }
        public static void Configure(IApplicationBuilder app, IServiceProvider serviceProvider,
            IWebHostEnvironment env)
        {
            app.UseHttpsRedirection();
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();

            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }
            app.UseCookiePolicy();
            app.UseSession();
            app.UseRouting();
            if (!Directory.Exists(Path.Combine(env.ContentRootPath, "smidge")))
                Directory.CreateDirectory(Path.Combine(env.ContentRootPath, "smidge"));
            app.UseStaticFiles(new StaticFileOptions()
            {
                FileProvider = new PhysicalFileProvider(
                    Path.Combine(env.ContentRootPath, "smidge")),
                RequestPath = new PathString("/smidge")
            });
            //app.UseStaticFiles(new StaticFileOptions()
            //{
            //    FileProvider = new PhysicalFileProvider(
            //        Path.Combine(env.ContentRootPath, "wwwroot", "uploads")),
            //    RequestPath = new PathString("/uploads")
            //});
            //core
            app.UseWebSockets();
            app.UseKachuwaCore(env, serviceProvider);
            app.UseKachuwaWeb(env, false);
            app.UseRateLimiter();
            app.UseEndpoints(endpoints =>
            {

                //endpoints.MapControllerRoute(
                //    name: "default",
                //    pattern: "{pageUrl?}",
                //    defaults: new { controller = "KachuwaPage", action = "Index" }
                //    //, constraints: new { pageUrl = @"\w+" }
                //);
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller}/{action}/{id?}",
                    defaults: new { controller = "Home", action = "Index" });

                //endpoints.MapControllerRoute(
                //    name: "default1",
                //    pattern: "page/{pageUrl?}",
                //    defaults: new { controller = "KachuwaPage", action = "Index" }
                //    //, constraints: new { pageUrl = @"\w+" }
                //);
                //endpoints.MapControllerRoute(
                //    name: "default",
                //    pattern: "{controller}/{action}/{id?}",
                //    defaults: new { controller = "Home", action = "Index" });
                endpoints.MapControllerRoute(
                    name: "MyArea",
                    pattern: "{area:exists}/{controller}/{action}/{id?}",
                    defaults: new { area = "Admin", controller = "Dashboard", action = "Index" });
                //endpoints.MapControllerRoute(
                //    name: "default2",
                //    pattern: "{controller=Home}/{action=Index}/{id?}");
            });

            var permissionService = serviceProvider.GetService<IPermissionService>();
            permissionService.InitializeAsync();



        }
    }
    internal sealed class BearerSecuritySchemeTransformer
        : IOpenApiDocumentTransformer
    {
        private readonly IAuthenticationSchemeProvider _schemeProvider;

        public BearerSecuritySchemeTransformer(IAuthenticationSchemeProvider schemeProvider)
        {
            _schemeProvider = schemeProvider;
        }

        public async Task TransformAsync(OpenApiDocument document,
            OpenApiDocumentTransformerContext context,
            CancellationToken cancellationToken)
        {
            var schemes = await _schemeProvider.GetAllSchemesAsync();
            if (!schemes.Any(a => a.Name == "Bearer"))
                return;

            document.Components ??= new OpenApiComponents();

            var bearerScheme = new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "JWT Authorization header using the Bearer scheme."
            };

            // Add scheme
            document.Components.SecuritySchemes["Bearer"] = bearerScheme;

            // Require auth for all operations (optional, but usually what you want)
            var securityRequirement = new OpenApiSecurityRequirement
            {
                [new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    { Id = "Bearer", Type = ReferenceType.SecurityScheme }
                }
                ] = Array.Empty<string>()
            };

            foreach (var path in document.Paths.Values)
            {
                foreach (var operation in path.Operations.Values)
                {
                    operation.Security ??= new List<OpenApiSecurityRequirement>();
                    operation.Security.Add(securityRequirement);
                }
            }
        }
    }

}

