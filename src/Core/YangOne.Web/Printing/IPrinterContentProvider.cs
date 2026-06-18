// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Printing
{
    /// <summary>
    /// Provides print content for a specific printer.
    /// </summary>
    public interface IPrinterContentProvider
    {
        IList<string> GetContent(IPrinter printer);
    }
}
