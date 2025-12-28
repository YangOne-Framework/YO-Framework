
namespace YangOne.FCM
{
    public interface IFCMService
    {
        void FcmSend(string token, string title, string message, string click_Url, string image_Uri, string key1, string key2,string key3);
    }
}
