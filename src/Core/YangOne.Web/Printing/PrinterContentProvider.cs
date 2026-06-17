// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Printing
{
    public class PrinterContentProvider : IPrinterContentProvider
    {
        private readonly IEnumerable<IPrinter> _printers;

        public PrinterContentProvider(IEnumerable<IPrinter> printers)
        {
            _printers = printers;
        }
        public IList<string> GetContent(IPrinter printer)
        {
            throw new System.NotImplementedException();
        }
    }
}
