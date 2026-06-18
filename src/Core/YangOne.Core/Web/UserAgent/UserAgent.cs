// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web
{
    /// <summary>
    /// Parses a user agent string to identify the browser and operating system.
    /// </summary>
    public class UserAgent
    {
        private string _userAgent;

        private ClientBrowser _browser;
        public ClientBrowser Browser
        {
            get
            {
                if (_browser == null)
                {
                    _browser = new ClientBrowser(_userAgent);
                }
                return _browser;
            }
        }

        private ClientOS _os;
        public ClientOS OS
        {
            get
            {
                if (_os == null)
                {
                    _os = new ClientOS(_userAgent);
                }
                return _os;
            }
        }

        public UserAgent(string userAgent)
        {
            _userAgent = userAgent;
        }
    }
}
