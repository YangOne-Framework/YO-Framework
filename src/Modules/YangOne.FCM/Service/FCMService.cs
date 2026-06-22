// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.

using System.Text;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System.Net.Http.Headers;
using System.Reflection;
using Google.Apis.Auth.OAuth2;

namespace YangOne.FCM
{
    /// <summary>
    /// Represents a class Data.
    /// </summary>
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

    /// <summary>
    /// Represents a class Message.
    /// </summary>
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

    /// <summary>
    /// Represents a class Notification.
    /// </summary>
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

    /// <summary>
    /// Represents a class Root.
    /// </summary>
    public class Root
    {

        public Message message
        {
            get;
            set;
        }

    }

    /// <summary>
    /// Represents a class FCMService.
    /// </summary>
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

        public async Task FcmSendAsync(string token, string title, string message, string click_Url, string image_Uri, string key1,string key2,string key3)
        {
            var bearertoken = await GetToken();

            var client = _httpClientFactory.CreateClient();

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", bearertoken);

            Root rootObj = new Root();
            rootObj.message = new Message();

            rootObj.message.token = token;
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

            var jsonObj = JsonConvert.SerializeObject(rootObj);

            var data = new StringContent(jsonObj, Encoding.UTF8, "application/json");
            data.Headers.ContentType = new MediaTypeHeaderValue("application/json");

            var response = await client.PostAsync("https://fcm.googleapis.com/v1/projects/whollistic-minds/messages:send", data);

            var jsonResponse = await response.Content.ReadAsStringAsync();
            var responseObj = JsonConvert.SerializeObject(jsonResponse);
        }



    }
}

