namespace YangOne.Web
{
    public class ResponseModel
    {
        public ResponseModel(int code, string msg, object data)
        {
            Code = code;
            Message = msg;
            Data = data;
        }
        public int Code { get; set; }
        public string Message { get; set; }
        public object Data { get; set; }
    }
}
