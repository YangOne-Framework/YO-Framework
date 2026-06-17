// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Layout
{
    public class LayoutContent
    {    public int PageId { get; set; }
        public string Name { get; set; } = "";
        public List<LayoutContentResource> Resources { get; set; }=new List<LayoutContentResource>();
        public List<Row> Rows { get; set; }=new List<Row>();
    }
}
