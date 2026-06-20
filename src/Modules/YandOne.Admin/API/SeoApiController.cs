// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Mvc;
using YangOne.Admin.Dto;
using YangOne.Data.Extension;
using YangOne.Identity.Extensions;
using YangOne.Log;
using YangOne.Storage;
using YangOne.Web;
using YangOne.Web.API;
using YangOne.Web.Model;

namespace YandOne.Admin.API;

[Route("api/v1/seo")]
/// <summary>
/// Represents a class SeoApiController.
/// </summary>
public class SeoApiController : BaseApiController
{
    private readonly ISeoService _seoService;
    private readonly ILogger _logger;
    private readonly IStorageProvider _storageProvider;

    public SeoApiController(ISeoService seoService, ILogger logger,IStorageProvider storageProvider)
    {
        _seoService = seoService;
        _logger = logger;
        _storageProvider = storageProvider;
    }
    [HttpGet]
    [Route("all")]
    public async Task<ActionResult<ApiResponse<IEnumerable<SEO>>>> GetAll(
        [FromQuery] int offset = 1,
        [FromQuery] int limit = 20,
        [FromQuery] string query = "")
    {
        try
        {
            var data = await _seoService.Seo.GetListPagedAsync(offset, limit,limit,"Where IsDeleted=@IsDeleted and MetaTitle like @Query","AddedOn desc",new
            {
                IsDeleted=false,
                Query ="%"+query+"%"
            });
            return SuccessResponse("Success", data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<IEnumerable<SEO>>(501, e.Message);
        }
    }
    // GET: api/v1/seo/by-url?url=/some-page&type=product
    [HttpGet("by-url")]
    public async Task<ActionResult<ApiResponse<SEO>>> GetSeoByUrl(
        [FromQuery] string url,
        [FromQuery] string type)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(url))
                return ErrorResponse<SEO>(400, "Url is required.");

            if (string.IsNullOrWhiteSpace(type))
                return ErrorResponse<SEO>(400, "Type is required.");

            var model = await _seoService.GetSEODataAsync(url, type);
            return SuccessResponse("Success", model);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<SEO>(501, e.Message);
        }
    }

    // GET: api/v1/seo/meta?url=/some-page&type=product
    [HttpGet("meta")]
    public async Task<ActionResult<ApiResponse<string>>> GetSeoMetaContents(
        [FromQuery] string url,
        [FromQuery] string type)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(url))
                return ErrorResponse<string>(400, "Url is required.");

            if (string.IsNullOrWhiteSpace(type))
                return ErrorResponse<string>(400, "Type is required.");

            var meta = await _seoService.GetSEOMetaContentsAsync(url, type);
            return SuccessResponse("Success", meta);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<string>(501, e.Message);
        }
    }

    // GET: api/v1/seo/by-id/123
    [HttpGet("by-id/{seoId:int}")]
    public async Task<ActionResult<ApiResponse<SEO>>> GetById([FromRoute] int seoId)
    {
        try
        {
            if (seoId <= 0)
                return ErrorResponse<SEO>(400, "Invalid seo id.");

            var model = await _seoService.Seo.GetAsync(seoId);
            if (model == null)
                return ErrorResponse<SEO>(404, "SEO not found.");

            return SuccessResponse("Success", model);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<SEO>(501, e.Message);
        }
    }

    // GET: api/v1/seo/by-seotype?seoType=product&id=10
    [HttpGet("by-seotype")]
    public async Task<ActionResult<ApiResponse<SEO>>> GetBySeoType(
        [FromQuery] string seoType,
        [FromQuery] int id)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(seoType))
                return ErrorResponse<SEO>(400, "SeoType is required.");

            if (id <= 0)
                return ErrorResponse<SEO>(400, "Id is required.");

            var model = await _seoService.GetBySeoType(seoType, id);
            return SuccessResponse("Success", model);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<SEO>(501, e.Message);
        }
    }

    // GET: api/v1/seo/by-product?productId=10&type=product
    [HttpGet("by-product")]
    public async Task<ActionResult<ApiResponse<SEO>>> GetByProductId(
        [FromQuery] int productId,
        [FromQuery] string type)
    {
        try
        {
            if (productId <= 0)
                return ErrorResponse<SEO>(400, "ProductId is required.");

            if (string.IsNullOrWhiteSpace(type))
                return ErrorResponse<SEO>(400, "Type is required.");

            var model = await _seoService.GetByProductId(productId, type);
            return SuccessResponse("Success", model);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<SEO>(501, e.Message);
        }
    }

    // POST: api/v1/seo/check-url
    // body: { "url": "/abc", "type": "product" }
    [HttpPost("check-url")]
    public async Task<ActionResult<ApiResponse<bool>>> CheckUrlExist([FromBody] CheckSeoUrlRequest request)
    {
        try
        {
            if (request == null)
                return ErrorResponse<bool>(400, "Invalid request.");

            if (string.IsNullOrWhiteSpace(request.Url))
                return ErrorResponse<bool>(400, "Url is required.");

            if (string.IsNullOrWhiteSpace(request.Type))
                return ErrorResponse<bool>(400, "Type is required.");

            var exists = await _seoService.CheckUrlExist(request.Url, request.Type);
            return SuccessResponse("Success", exists);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    // POST: api/v1/seo/new
    [HttpPost("new")]
    public async Task<ActionResult<ApiResponse<SEO>>> Create([FromForm] SEO model)
    {
        if (!ModelState.IsValid)
            return ErrorResponse<SEO>(ModelState, 600, model);

        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<SEO>();

            if (model.SEOId != 0)
                return ErrorResponse<SEO>(400, "SEOId must be 0 for creation.");

            model.AutoFill();

            // Optional: prevent duplicate URL by type
            if (!string.IsNullOrWhiteSpace(model.Url) && !string.IsNullOrWhiteSpace(model.SeoType))
            {
                var exists = await _seoService.CheckUrlExist(model.Url, model.SeoType);
                if (exists)
                    return ErrorResponse<SEO>(409, "Url already in use.");
            }
            if (model.ImageFile != null)
            {
                model.Image = await _storageProvider.Save("SEO", model.ImageFile);
            }
            await _seoService.Seo.InsertAsync<int>(model);
            return SuccessResponse("Saved successfully", model);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<SEO>(501, e.Message);
        }
    }

    // POST: api/v1/seo/update
    [HttpPost("update")]
    public async Task<ActionResult<ApiResponse<bool>>> Update([FromForm] SEO model)
    {
        if (!ModelState.IsValid)
            return ErrorResponse<bool>(ModelState, 600, model);

        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<bool>();

            if (model.SEOId <= 0)
                return ErrorResponse<bool>(400, "Invalid SEOId.");

            model.AutoFill();

            if (model.ImageFile != null)
            {
                model.Image = await _storageProvider.Save("SEO", model.ImageFile);
            }
            await _seoService.Seo.UpdateAsync(model);
            return SuccessResponse("Updated successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    // DELETE: api/v1/seo/{seoId}
    [HttpDelete("{seoId:int}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete([FromRoute] int seoId)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<bool>();

            if (seoId <= 0)
                return ErrorResponse<bool>(400, "Invalid SEOId.");

            var existing = await _seoService.Seo.GetAsync(seoId);
            if (existing == null)
                return ErrorResponse<bool>(404, "SEO not found.");

            await _seoService.Seo.UpdateAsDeleted(seoId);
            return SuccessResponse("Deleted successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    // GET: api/v1/seo/jsonld/website
    [HttpGet("jsonld/website")]
    public async Task<ActionResult<ApiResponse<string>>> GenerateJsonLdForWebSite()
    {
        try
        {
            var jsonLd = await _seoService.GenerateJsonLdForWebSite();
            return SuccessResponse("Success", jsonLd);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<string>(501, e.Message);
        }
    }

    // GET: api/v1/seo/jsonld/page
    [HttpGet("jsonld/page")]
    public async Task<ActionResult<ApiResponse<string>>> GenerateJsonLdForPage()
    {
        try
        {
            var jsonLd = await _seoService.GenerateJsonLdForPage();
            return SuccessResponse("Success", jsonLd);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<string>(501, e.Message);
        }
    }

    // GET: api/v1/seo/jsonld/page/by-product?page=/p/some-slug&productId=10&type=product
    [HttpGet("jsonld/page/by-product")]
    public async Task<ActionResult<ApiResponse<string>>> GenerateJsonLdForPage(
        [FromQuery] string page,
        [FromQuery] int productId,
        [FromQuery] string type)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(page))
                return ErrorResponse<string>(400, "Page is required.");

            if (productId <= 0)
                return ErrorResponse<string>(400, "ProductId is required.");

            if (string.IsNullOrWhiteSpace(type))
                return ErrorResponse<string>(400, "Type is required.");

            var jsonLd = await _seoService.GenerateJsonLdForPage(page, productId, type);
            return SuccessResponse("Success", jsonLd);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<string>(501, e.Message);
        }
    }

    // GET: api/v1/seo/meta/generate
    [HttpGet("meta/generate")]
    public async Task<ActionResult<ApiResponse<string>>> GenerateMetaContents()
    {
        try
        {
            var meta = await _seoService.GenerateMetaContents();
            return SuccessResponse("Success", meta);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<string>(501, e.Message);
        }
    }
}
