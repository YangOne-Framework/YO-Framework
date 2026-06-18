// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.

namespace YangOne.Web.Service
{
    /// <summary>
    /// Provides helper methods for phone number formatting and SMS sender operations.
    /// </summary>
    public static class PhoneNoHelper
    {
        public static string PhoneNumberWithoutCountry(this string phoneNumber)
        {

            if (phoneNumber.StartsWith("+977"))
            {
                return phoneNumber.Substring(4);
            }
            else if (phoneNumber.StartsWith("977"))
            {
                return phoneNumber.Substring(3);
            }
            else
            {
                if (phoneNumber.Length - 10 > 0) //taking last 10 number
                    return phoneNumber.Substring(phoneNumber.Length - 10);
                else return phoneNumber;
            }

            //return phoneNumber;
        }

        public static string CleanAlfaNum(this string smsSender)
        {

            if (smsSender.StartsWith("+977"))
            {
                return smsSender.Substring(4);
            }
            else if (smsSender.StartsWith("977"))
            {
                return smsSender.Substring(3);
            }

            return smsSender;
        }
        public static string ToAsteric(this string phoneNumber,int start,int end)
        {

            char[] chars = phoneNumber.ToCharArray();
            for(int i = start; i < end; i++)
            {
                chars[i] = '*';
            }

            return chars.ToString();
        }
    }

    /// <summary>
    /// Defines the contract for sending SMS messages.
    /// </summary>
    public interface ISmsSender
    {
        Task SendSmsAsync(string number, string message);
    }

    /// <summary>
    /// Defines the contract for SMS template operations.
    /// </summary>
    public interface ISMSTemplateService
    {

    }

    /// <summary>
    /// Provides SMS template management functionality.
    /// </summary>
    public class SMSTemplateService: ISMSTemplateService
    {

    }
}

