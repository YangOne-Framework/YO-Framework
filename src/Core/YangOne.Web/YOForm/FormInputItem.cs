// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Form
{
    public class FormInputItem
    {
        public int Id { get; set; }
        public string Value { get; set; }
        public string Label { get; set; }
        public bool IsSelected { get; set; } = false;
    }
}
