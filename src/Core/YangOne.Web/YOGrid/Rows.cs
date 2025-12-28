using System.Collections;

namespace YangOne.Web.Grid
{
    public interface IYOGridRow
    {

    }
    public interface IYOGridRow<out T>
    {
        string CssClasses { get; set; }
        T Model { get; }
    }
    public interface IYOGridRows<out T> : IEnumerable<IYOGridRow<T>>
    {
    }

    public interface IYOGridRowsOf<T> : IYOGridRows<T>
    {
        Func<T, string> CssClasses { get; set; }
        IYOGrid<T> Grid { get; }
    }
    public interface IYOGridRows
    {

    }
    public class YOGridRow<T> : IYOGridRow<T>
    {
        public string CssClasses { get; set; }
        public T Model { get; set; }

        public YOGridRow(T model)
        {
            Model = model;
        }
    }
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
