// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Layout
{
    /// <summary>
    /// Defines a grid system for layout rendering.
    /// </summary>
    public interface ILayoutGridSystem
    {
        string FluidContainer { get; set; }
        string Container { get; set; }
        string Row { get; set; }
        int NoOfColumnsPerRow { get; set; }
        string ColumnPrefix { get; set; }
        string ColumnSuffix { get; set; }
        string ColumnConcatSymbol { get; set; }
        string ColumnExtraSmall { get; set; }
        string ColumnSmall { get; set; }
        string ColumnMedium { get; set; }
        string ColumngLarge { get; set; }
        string ColumnExtraLarge { get; set; }

        string GetColumnClass(int width);
    }
}
