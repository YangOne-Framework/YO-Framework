// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;
using System.Text;

namespace YangOne.Log
{
    /// <summary>
    /// Represents Simple String Logger
    /// </summary>
    public static class StringLogger
    {
        private static readonly StringBuilder Buffer = new StringBuilder();
        public static void Log(string value)
        {
            lock (Buffer)
            {
                Buffer.AppendLine($"{DateTime.Now} {value}");
            }
        }

        public new static string ToString()
        {
            lock (Buffer)
            {
                return Buffer.ToString();
            }
        }
    }
}
