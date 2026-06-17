// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Data
{
    public class QueryRequest
    {
        public bool KeyHasPredefinedValue { get; set; }=false;
        public bool IsKeyGuidType { get; set; } = false;
        public object Id { get; set; }
        public string QuerySql { get; set; }
        public object Parameters { get; set; }
    }
}
