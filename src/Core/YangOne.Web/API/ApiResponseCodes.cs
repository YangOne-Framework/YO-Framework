// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.

namespace YangOne.Web.API
{
    /// <summary>
    /// Defines standard API response code constants.
    /// </summary>
    public class ApiResponseCodes
    {
        public enum Codes
        {
            User_Not_Registerd = 901,
            ModelValidationError = 904,
            LoginError = 902,
            SavingError = 903,
            UserAlreadyExist = 905,
            InvalidFileExtensions = 906,
            FileNotFound = 907,
            InvalidUser = 908,
            Exception=500
        }
    }
}

