// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.

namespace YangOne.Web.Printing
{
    /// <summary>
    /// Default printer implementation (not yet implemented).
    /// </summary>
    public class DefaultPrinter : IPrinter
    {
        public string Name { get; set; }
        public void Print(string ipAddress, int port, IList<string> linesToPrint)
        {
            throw new NotImplementedException();
        }
    }
}

