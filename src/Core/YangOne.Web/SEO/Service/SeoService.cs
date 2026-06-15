using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Routing;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using MXTires.Microdata.Core;
using MXTires.Microdata.Core.CreativeWorks;
using MXTires.Microdata.Core.Intangible;
using MXTires.Microdata.Core.Intangible.StructuredValues;
using System;
using System.Collections.Concurrent;
using System.Data;
using System.Data.Common;
using System.Text;
using YangOne.Caching;
using YangOne.Configuration;
using YangOne.Data;
using YangOne.Log;
using YangOne.Web.Model;
using YangOne.Web.Service;

namespace YangOne.Web
{
    public class SeoService : ISeoService
    {
        private readonly ILogger _logger;
        private readonly ISettingService _settingService;
        private readonly IActionContextAccessor _actionContextAccessor;      
        private Setting _setting;
        private YangOneAppConfig _appConfig;
        private readonly ICacheService _cacheService;


        [ViewContext] public ViewContext ViewContext { get; set; }

        public IUrlHelperFactory UrlHelperFactory { get; set; }

        public SeoService(ISettingService settingService, IActionContextAccessor actionContextAccessor, ILogger logger,
            IUrlHelperFactory urlHelperFactory,ICacheService cacheService)
        {

            _settingService = settingService;
            _actionContextAccessor = actionContextAccessor;
            _logger = logger;
            UrlHelperFactory = urlHelperFactory;
            _cacheService= cacheService;
        }

        public CrudService<SEO> Seo { get; set; } = new CrudService<SEO>();


        private string Path { get; set; }
        private bool IsDynamicPage = false;

        private async Task<SEO> GetPageContents(string url)
        {
            if (!url.StartsWith("/"))
                url = "/" + url;
            return await Seo.GetAsync("Where url=@url", new { url });
        }

        private string GetPage()
        {
            if (ContextResolver.Context.Items.Keys.Contains("KPageUrl"))
            {
                var url = ContextResolver.Context.Items["KPageUrl"];
                IsDynamicPage = true;
                return url.ToString();
            }
            else
            {
                IsDynamicPage = false;
                // Use HttpContext.Request.Path to capture both MVC and React SPA routes
                // (MapFallbackToController maps all React routes to Home/Index, so RouteData
                //  always returns "Index"/"Home" � losing the actual page URL)
                var path = ContextResolver.Context.Request.Path.Value;
                return string.IsNullOrEmpty(path) || path == "/" ? "/" : path;
            }

        }

        public async Task<string> GenerateMetaContents()
        {
            try
            {
                string path = GetPage();
                string metatags = await _cacheService.GetAsync<string>($"SEOMetaTagHelper_{path}",
                    async () =>
                    {
                        var appConfig = ContextResolver.Context.RequestServices
                            .GetService<IOptionsSnapshot<YangOneAppConfig>>();
                        _appConfig = appConfig.Value;
                        var actionContext = _actionContextAccessor.ActionContext;
                        var _urlHelper = UrlHelperFactory.GetUrlHelper(actionContext);
                        _setting = await _settingService.CrudService.GetAsync(1);


                        StringBuilder metatags = new StringBuilder();
                        var page = await GetPageContents(path);
                        if (page == null)
                            return "";
                        else
                        {

                            var title = new TitleTag(new ConcurrentDictionary<string, string> { ["title"] = page.MetaTitle });
                            metatags.Append(title.Generate());
                            var normalMetatag = new MetaTag(new ConcurrentDictionary<string, string>
                            {
                                ["title"] = page.MetaTitle,
                                ["name"] = page.MetaTitle,
                                ["description"] = page.MetaDescription,
                                ["image"] = _appConfig.SiteUrl + page.Image
                            });
                            metatags.Append(normalMetatag.Generate());
                            var openGrap = new OgMetaTag(new ConcurrentDictionary<string, string>
                            {

                                ["type"] = "website"
                                ,
                                ["title"] = page.MetaTitle,
                                ["description"] = page.MetaDescription,
                                ["type"] = "article",//product
                                ["locale"] = _setting.BaseCulture,
                                ["image"] = _appConfig.SiteUrl + page.Image,
                                ["url"] = _appConfig.SiteUrl + page.Url,

                            }, _appConfig.FacebookAppId);
                            metatags.Append(openGrap.Generate());

                            var twitter = new TwitterMetaTag(new ConcurrentDictionary<string, string>
                            {
                                ["card"] = "summary",
                                ["title"] = page.MetaTitle,
                                ["description"] = page.MetaDescription,
                                ["image"] = _appConfig.SiteUrl + page.Image
                            });
                            metatags.Append(twitter.Generate());
                            return metatags.ToString();

                        }


                    }, TimeSpan.FromHours(1));


                return metatags;
            }
            catch (Exception ex)
            {
                _logger.Log(LogType.Error, () => ex.Message, ex);
                return "";
            }

        }

        public async Task<bool> CheckUrlExist(string url, string type)
        {
            var dbfactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbfactory.GetConnection())
            {
                await db.OpenAsync();
                var result = await db.ExecuteScalarAsync<int>(
                    "IF (EXISTS(SELECT 1 FROM SEO WHERE SEOType = @SEOType AND Url = @Url))" +
                    "BEGIN Select 1;END ELSE Begin Select 0 ;End "
                    , new
                    {
                        Url = url,
                        SEOType = type
                    });
                return result == 1;
            }
        }


        public async Task<SEO> GetBySeoType(string seoType, int id)
        {
            var dbfactory = DbFactoryProvider.GetFactory();
            using (var db = (SqlConnection)dbfactory.GetConnection())
            {
                await db.OpenAsync();
                return await db.QueryFirstAsync<SEO>(
                    "Select * from Seo Where SeoType=@SeoType and ProductId=@ProductId",
                    new { SeoType = seoType, ProductId = id });

            }
        }


        public async Task<string> GenerateJsonLdForWebSite()
        {
            try
            {

                _setting = await _settingService.CrudService.GetAsync(1);
                var appConfig = ContextResolver.Context.RequestServices
                    .GetService<IOptionsSnapshot<YangOneAppConfig>>();
                _appConfig = appConfig.Value;
                var storeInfo = _setting;
                var site = new WebSite
                {
                    AlternateName = storeInfo.WebsiteName,
                    Url = _appConfig.SiteUrl,
                    Image = _appConfig.SiteUrl + storeInfo.Logo,
                    PotentialAction = new SearchAction()
                    {
                        Target = new MXTires.Microdata.Core.Intangible.EntryPoint()
                        {
                            UrlTemplate = _appConfig.SiteUrl + "/search?q={q}",
                        },
                        //Query = "required name=q",
                        QueryInput =
                            new PropertyValueSpecification()
                            {
                                ValueName = "q",
                                ValueRequired = true,
                                MultipleValues = true
                            },
                        ActionStatus = MXTires.Microdata.Core.Intangible.Enumeration.ActionStatusType
                            .PotentialActionStatus,
                    }
                };

                //page.MainEntity = new Products();
                //{
                //    Name = "Boz Scaggs",
                //    StartDate = "2015-05-02T20:00",
                //    Location = new Place() { Name = "Coral Springs Center for the Performing Arts", Address = new PostalAddress() { AddressLocality = "Coral Springs, FL" } },
                //    Offers = new List<Offer>() { new Offer() { Url = "http://frontgatetickets.com/venue.php?id=11766" } }
                //};
                LocalBusiness shop = new LocalBusiness()
                {
                    Name = storeInfo.WebsiteName,
                    Description = storeInfo.Description, // storeInfo.Description,
                    CurrenciesAccepted = storeInfo.BaseCurrency,
                };

                Language language = new Language() { Name = "English" }; //may need more differentiation
                string countryName = "";
                if (storeInfo.CountryId > 0)
                {
                    var dbFactory = DbFactoryProvider.GetFactory();
                    using var db = (DbConnection)dbFactory.GetConnection();
                    await db.OpenAsync();
                    countryName = await db.ExecuteScalarAsync<string>(
                        "select Name from [dbo].[Country] where CountryId=@CountryId",
                        new { storeInfo.CountryId });
                }
                shop.Address = new PostalAddress()
                {
                    AddressCountry = countryName,
                    //AddressRegion = "BC",
                    AddressLocality = storeInfo.Address1,
                    PostalCode = "",
                    StreetAddress = storeInfo.Address2,
                    AreaServed = storeInfo.City,
                    AvailableLanguage = language,
                    Email = storeInfo.Email,
                    Telephone = storeInfo.PhoneNumber
                };
                shop.Location = new Place();
                shop.Location.Geo = new GeoCoordinates((float)storeInfo.Longitude, (float)storeInfo.Lattitude);
                site.SourceOrganization = shop;
                return site.ToIndentedJson();
            }
            catch (Exception ex)
            {
                _logger.Log(LogType.Error, () => ex.Message, ex);
                return "";
            }
        }

        public async Task<string> GenerateJsonLdForPage()
        {
            var actionContext = _actionContextAccessor.ActionContext;
            var _urlHelper = UrlHelperFactory.GetUrlHelper(actionContext);
            string path = GetPage();

            var page = await GetPageContents(path);
            if (page == null)
                return "";
            else
            {
                var appConfig = ContextResolver.Context.RequestServices
                    .GetService<IOptionsSnapshot<YangOneAppConfig>>();
                _appConfig = appConfig.Value;
                var storeInfo = _setting;
                var webpage = new WebPage()
                {
                    Image = _appConfig.SiteUrl +
                            (string.IsNullOrEmpty(page.Image) == true ? storeInfo.Logo : page.Image),
                    Description = page.MetaDescription,
                    Headline = page.MetaTitle,
                    Url = _appConfig.SiteUrl + page.Url,
                    Name = page.MetaTitle,
                    DateCreated = page.AddedOn

                };
                return webpage.ToIndentedJson();
            }

        }

        public async Task<SEO> GetByProductId(int producId = 0, string type = "page")
        {
            return await Seo.GetAsync("Where ProductId=@ProductId and SeoType=@SeoType ", new { SeoType = type, ProductId = producId });

        }

        public async Task<string> GenerateJsonLdForPage(string page, int productId, string type)
        {
            string path = page;

            var pageContent = productId > 0 ? await GetByProductId(productId, type) : await GetPageContents(path);
            if (pageContent == null)
                return "";
            else
            {
                var appConfig = ContextResolver.Context.RequestServices
                    .GetService<IOptionsSnapshot<YangOneAppConfig>>();
                _appConfig = appConfig.Value;
                var storeInfo = _setting;
                var webpage = new WebPage()
                {
                    Image = _appConfig.SiteUrl +
                            (string.IsNullOrEmpty(pageContent.Image) == true ? storeInfo.Logo : pageContent.Image),
                    Description = pageContent.MetaDescription,
                    Headline = pageContent.MetaTitle,
                    Url = _appConfig.SiteUrl + pageContent.Url,
                    Name = pageContent.MetaTitle,
                    DateCreated = pageContent.AddedOn

                };
                return webpage.ToIndentedJson();
            }

        }

        //public string GenerateJsonLdForProduct(int productId)
        //{
        //    var productService = (IProductService)AutofacDependencyResolver.Current.GetService(typeof(IProductService));
        //    var productData = productService.ProductCrud.Get(productId);
        //    var aggregate = productService.GetReviewSummarySync(productId);

        //    if (productData.ProductTypeId == 1)
        //    {
        //        var product = new Product()
        //        {
        //            Name = productData.Name,
        //            Category = "Category",
        //            Description = productData.Description,
        //            Url = "http://www.novolibooks.com/products" + productData.ProductUrl,
        //            AggregateRating = new AggregateRating()
        //            {
        //                Id = "/SiteAggregateRating",
        //                BestRating = aggregate.HighestRating.ToString(),
        //                WorstRating = aggregate.MinRating.ToString(),
        //                RatingValue = aggregate.AverageRating.ToString(),
        //                ReviewCount = aggregate.TotalReviews.ToString(),
        //                Description = "novolibooks.com Reviews and Ratings by customer.",
        //                Url = "http://www.novolibooks.com/products" + productData.ProductUrl,
        //            },
        //            Offers = new List<Offer>()
        //            {
        //                new Offer()
        //                {
        //                    Availability =
        //                        productData.Quantity > 1 ? ItemAvailability.InStock : ItemAvailability.OutOfStock,
        //                    Price = productData.Price.ToString(),
        //                    PriceCurrency = "GBP",
        //                    ItemCondition = OfferItemCondition.NewCondition,
        //                    Image = productData.RootImage,
        //                    AcceptedPaymentMethod = PaymentMethod.PayPal,

        //                }
        //            }

        //        };
        //        return product.ToIndentedJson();
        //    }
        //    else
        //    {
        //        var bookData = new BookService().Book.Get(productId);
        //        var product = new Book()
        //        {

        //            Name = productData.Name,
        //            Description = productData.Description,
        //            Url = "http://www.novolibooks.com/products" + productData.ProductUrl,
        //            BookFormat = (BookFormatType)Enum.Parse(typeof(BookFormatType), bookData.Binding),
        //            BookEdition = bookData.Edition,
        //            Author = new Person()
        //            {
        //                Name = bookData.Author
        //            },
        //            NumberOfPages = bookData.NoOfPages,
        //            InLanguage = bookData.Language,
        //            AggregateRating = new AggregateRating()
        //            {
        //                Id = "/SiteAggregateRating",
        //                BestRating = aggregate.HighestRating.ToString(),
        //                WorstRating = aggregate.MinRating.ToString(),
        //                RatingValue = aggregate.AverageRating.ToString(),
        //                ReviewCount = aggregate.TotalReviews.ToString(),
        //                Description = "novolibooks.com Reviews and Ratings by customer.",
        //                Url = "http://www.novolibooks.com/products" + productData.ProductUrl,
        //            },
        //            Offers = new List<Offer>()
        //            {
        //                new Offer()
        //                {
        //                    Availability =
        //                        productData.Quantity > 1 ? ItemAvailability.InStock : ItemAvailability.OutOfStock,
        //                    Price = productData.Price.ToString(),
        //                    PriceCurrency = "GBP",
        //                    ItemCondition = OfferItemCondition.NewCondition,
        //                    Image = productData.RootImage,
        //                    AcceptedPaymentMethod = PaymentMethod.PayPal,

        //                }
        //            }

        //        };
        //        return product.ToIndentedJson();
        //    }

        //    //Review review1 = new Review() { Name = "Review1", ReviewRating = new Rating() { RatingValue = "5" }, ReviewBody = "Best product ever!", Author = new Person() { Name = "Some Guy" } };
        //    //Review review2 = new Review() { Name = "Review2", ReviewRating = new Rating() { RatingValue = "4" }, ReviewBody = "I've seen better...", Author = new Person() { Name = "Other Guy" } };
        //    //product.Reviews = new List<Review> { review1, review2 };

        //}


        public async Task<string> GetSEOMetaContentsAsync(string url, string type)
        {
            var page = await Seo.GetAsync("Where lower(seoType)=lower(@seoType) and lower(Url)=lower(@url)",
                new { seoType = type, url });
            if (page == null)
                return "";
            else
            {
                StringBuilder metatags = new StringBuilder();

                var title = new TitleTag(new ConcurrentDictionary<string, string> { ["title"] = page.MetaTitle });
                metatags.Append(title.Generate());
                var normalMetatag = new MetaTag(new ConcurrentDictionary<string, string>
                {
                    ["title"] = page.MetaTitle,
                    ["name"] = page.MetaTitle,
                    ["description"] = page.MetaDescription,
                    ["image"] = _appConfig.SiteUrl + page.Image
                });
                metatags.Append(normalMetatag.Generate());
                var openGrap = new OgMetaTag(new ConcurrentDictionary<string, string>
                {

                    ["type"] = "website"
                    ,
                    ["title"] = page.MetaTitle,
                    ["description"] = page.MetaDescription,
                    ["type"] = "article",//product
                    ["locale"] = _setting.BaseCulture,
                    ["image"] = _appConfig.SiteUrl + page.Image,
                    ["url"] = _appConfig.SiteUrl + page.Url,

                }, _appConfig.FacebookAppId);
                metatags.Append(openGrap.Generate());

                var twitter = new TwitterMetaTag(new ConcurrentDictionary<string, string>
                {
                    ["card"] = "summary",
                    ["title"] = page.MetaTitle,
                    ["description"] = page.MetaDescription,
                    ["image"] = _appConfig.SiteUrl + page.Image
                });
                metatags.Append(twitter.Generate());
                return metatags.ToString();


            }

        }

        public async Task<SEO> GetSEODataAsync(string url, string type)
        {
            var page = await Seo.GetAsync("Where lower(seoType)=lower(@seoType) and (lower(Url)=lower(@url) or lower(Url)=lower('/'+@url))",
                new { seoType = type, url });
            return page;
        }

        public async Task<string> GetSitemapXml()
        {

            var dbfactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbfactory.GetConnection())
            {
                await db.OpenAsync();
                var xml = await db.ExecuteScalarAsync<string>(
                    "dbo.usp_GenerateSitemapXml"
                    , new
                    {
                        BaseUrl = "https://territoryhimalaya.com",
                        IncludeSeo = false
                    });

                return $@"<?xml version=""1.0"" encoding=""UTF-8""?>
{xml}";

            }
        }
    }
}