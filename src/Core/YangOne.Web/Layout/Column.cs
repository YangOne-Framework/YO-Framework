// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Layout
{
    /// <summary>
    /// Represents a column in a layout row.
    /// </summary>
    public class Column
    {
        public int ColumnId { get; set; }
        public string Name { get; set; } = "";
        public int Order { get; set; }
        public string ClassName { get; set; } = "";
        public string Content { get; set; } = "";
        public int Width { get; set; }
        public List<ColumnModule> Components { get; set; }=new List<ColumnModule>();
    }
}
