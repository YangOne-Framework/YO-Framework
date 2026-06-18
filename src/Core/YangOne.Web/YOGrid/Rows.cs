// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Collections;

namespace YangOne.Web.Grid
{
    /// <summary>
    /// Defines a grid row.
    /// </summary>
    public interface IYOGridRow
    {

    }
    /// <summary>
    /// Defines a typed grid row with a model.
    /// </summary>
    public interface IYOGridRow<out T>
    {
        string CssClasses { get; set; }
        T Model { get; }
    }
    /// <summary>
    /// Defines a collection of grid rows.
    /// </summary>
    public interface IYOGridRows<out T> : IEnumerable<IYOGridRow<T>>
    {
    }

    /// <summary>
    /// Defines typed grid rows with CSS class support.
    /// </summary>
    public interface IYOGridRowsOf<T> : IYOGridRows<T>
    {
        Func<T, string> CssClasses { get; set; }
        IYOGrid<T> Grid { get; }
    }
    /// <summary>
    /// Defines a non-generic grid rows interface.
    /// </summary>
    public interface IYOGridRows
    {

    }
    /// <summary>
    /// Default implementation of a typed grid row.
    /// </summary>
    public class YOGridRow<T> : IYOGridRow<T>
    {
        public string CssClasses { get; set; }
        public T Model { get; set; }

        public YOGridRow(T model)
        {
            Model = model;
        }
    }
    /// <summary>
    /// Default implementation of a typed grid rows collection.
    /// </summary>
    public class YOGridRows<T> : IYOGridRowsOf<T>
    {
        public IEnumerable<IYOGridRow<T>> CurrentRows { get; set; }
        public Func<T, string> CssClasses { get; set; }
        public IYOGrid<T> Grid { get; set; }

        public YOGridRows(IYOGrid<T> grid)
        {
            Grid = grid;
        }

        public virtual IEnumerator<IYOGridRow<T>> GetEnumerator()
        {
            if (CurrentRows == null)
            {
                var items = Grid.Source;
                CurrentRows = items
                  .ToList()
                  .Select(model => new YOGridRow<T>(model)
                  {
                      CssClasses = CssClasses?.Invoke(model)
                  });
                //IQueryable<T> items = Grid.Source;
                //foreach (IGridProcessor<T> processor in Grid.Processors.Where(proc => proc.ProcessorType == GridProcessorType.Pre))
                //    items = processor.Process(items);

                //foreach (IGridProcessor<T> processor in Grid.Processors.Where(proc => proc.ProcessorType == GridProcessorType.Post))
                //    items = processor.Process(items);

                //CurrentRows = items
                //    .ToList()
                //    .Select(model => new GridRow<T>(model)
                //    {
                //        CssClasses = CssClasses?.Invoke(model)
                //    });
            }

            return CurrentRows.GetEnumerator();
        }
        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }
    }

}

