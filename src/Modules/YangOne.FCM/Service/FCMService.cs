
using System.Text;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System.Net.Http.Headers;
using System.Reflection;
using Google.Apis.Auth.OAuth2;

namespace YangOne.FCM
{
    public class Data
    {

        public string body
        {
            get;
            set;
        }

        public string title
        {
            get;
            set;
        }

        public string key_1
        {
            get;
            set;
        }

        public string key_2
        {
            get;
            set;
        }
        public string key_3
        {
            get;
            set;
        }
        public string link { get; set; }

    }

    public class Message
    {

        public string token
        {
            get;
            set;
        }

        public Data data
        {
            get;
            set;
        }

        public Notification notification
        {
            get;
            set;
        }

    }

    public class Notification
    {
        //public string icon { get; set; }
        //public string click_action { get; set; }

        public string title
        {
            get;
            set;
        }

        public string body
        {
            get;
            set;
        }

    }

    public class Root
    {

        public Message message
        {
            get;
            set;
        }

    }

    public class FCMService : IFCMService
    {
        private readonly FCMSetting _settings;
        private readonly IHttpClientFactory _httpClientFactory;

        public FCMService(IConfiguration configuration, IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        public async Task<string> GetToken()
        {
            try
            {
                string fileName = Path.Combine(Path.GetDirectoryName(Assembly.GetEntryAssembly().Location), "wmfcm_google.json");

                string scopes = "https://www.googleapis.com/auth/firebase.messaging";

                using (var stream = new FileStream(fileName, FileMode.Open, FileAccess.Read))
                {
                    return await GoogleCredential
                        .FromStream(stream) // Loads key file
                        .CreateScoped(scopes) // Gathers scopes requested
                        .UnderlyingCredential // Gets the credentials
                        .GetAccessTokenForRequestAsync(); // Gets the Access Token
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw e;
            }
        }

        public void FcmSend(string token, string title, string message, string click_Url, string image_Uri, string key1,string key2,string key3)
        {
            //if (String.IsNullOrEmpty(token))
            //    throw new Exception($"Empty Token");

            //var client = _httpClientFactory.CreateClient();
            //client.BaseAddress = new Uri("https://fcm.googleapis.com/v1/projects/fullmoon-e897f");
            //client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            //client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("key", "=" + _settings.ApplicationId);
            //client.DefaultRequestHeaders.Add("Sender", $"id={_settings.SenderId}");

            //var data = new
            //{
            //    to = token,
            //    notification = new
            //    {
            //        body = message,
            //        title = title,
            //        sound = "Enabled"
            //    }
            //};
            //var data2 = new
            //{
            //    to = "/topics/" + token,
            //    priority = "high",
            //    collapse_key = "demo",
            //    notification = new
            //    {
            //        body = message,
            //        title = title,
            //        icon = String.IsNullOrEmpty(Image_Uri) ? null : Image_Uri,
            //        click_action = String.IsNullOrEmpty(Click_Url) ? null : Click_Url,
            //        sound = "Enabled",
            //    }
            //};
            //var JsonData = JsonConvert.SerializeObject(data);

            //HttpContent contentPost = new StringContent(JsonData, Encoding.UTF8, MediaTypeNames.Application.Json);
            //var Re = client.PostAsync("/messages:send", contentPost).Result;
            ///--------Calling FCM-----------------------------

            var bearertoken = GetToken().Result;

            var clientHandler = new HttpClientHandler();
            var client = new HttpClient(clientHandler);

            client.BaseAddress = new Uri("https://fcm.googleapis.com/v1/projects/whollistic-minds/messages:send"); // FCM HttpV1 API

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            //client.DefaultRequestHeaders.Accept.Add("Authorization", "Bearer " + bearertoken);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", bearertoken); // Authorization Token in this variable

            //---------------Assigning Of data To Model --------------

            Root rootObj = new Root();
            rootObj.message = new Message();

            rootObj.message.token = token;//FCM Token id
            rootObj.message.data = new Data();
            rootObj.message.data.title = title;
            rootObj.message.data.body = message;
            rootObj.message.data.key_1 = key1;
            rootObj.message.data.key_2 = key2;
            rootObj.message.data.key_3 = key3;
            rootObj.message.data.link = String.IsNullOrEmpty(click_Url) ? null : click_Url;
            rootObj.message.notification = new Notification();
            rootObj.message.notification.title = title;
            rootObj.message.notification.body = message;
            //rootObj.message.notification.click_action = String.IsNullOrEmpty(click_Url) ? null : click_Url;
            //rootObj.message.notification.icon = String.IsNullOrEmpty(image_Uri) ? null : image_Uri;


            //-------------Convert Model To JSON ----------------------

            var jsonObj = JsonConvert.SerializeObject(rootObj);

            //------------------------Calling Of FCM Notify API-------------------

            var data = new StringContent(jsonObj, Encoding.UTF8, "application/json");
            data.Headers.ContentType = new MediaTypeHeaderValue("application/json");

            var response = client.PostAsync("https://fcm.googleapis.com/v1/projects/whollistic-minds/messages:send", data).Result; // Calling The FCM httpv1 API

            //---------- Deserialize Json Response from API ----------------------------------

            var jsonResponse = response.Content.ReadAsStringAsync().Result;
            var responseObj = JsonConvert.SerializeObject(jsonResponse);
        }



    }
}
