using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using YangOne.Log;
using YangOne.Web.API;

namespace YangOne.FCM.API
{
    [Route("api/v1/fcm")]
    [AllowAnonymous]
    public  class FCMTestApiController:BaseApiController
    {
        private readonly IFCMService _fcmService;
        private readonly ILogger _logger;

        public FCMTestApiController(IFCMService fcmService,ILogger logger)
        {
            _fcmService = fcmService;
            _logger = logger;
        }

        [HttpGet]
        [Route("test")]
        [AllowAnonymous]
        public async Task<dynamic> TestFCM(string usertoken, string title, string message, string clickUrl, string imageUrl,string key1,string key2,string key3)
        {
            try
            {

                 _fcmService.FcmSend(usertoken, title, message, clickUrl, imageUrl, key1, key2, key3);
                return HttpResponse(200, "", true);
            }
            catch (Exception e)
            {
                _logger.Log(LogType.Error, () => e.Message.ToString(), e);
                return ErrorResponse(500,e.Message);
            }

        }
    }
}
