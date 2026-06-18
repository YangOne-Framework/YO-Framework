// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web
{
    /// <summary>
    /// Generic response model with code, message and data.
    /// </summary>
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

