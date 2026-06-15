   @ConfigureServices

   //Cache config start
    services.AddCaching();
	//
  services.AddSingleton<ICache, DefaultCache>(); or use redis

   services.AddTransient<YOCacheAttribute>();



   @Configure
     app.UseMiddleware<CacheMiddleware>();
  [YOCache(Duration = 30)]//in second
        public IActionResult Index()