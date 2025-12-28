using System.Reflection;

namespace YangOne.Data.Crud
{
    public interface IColumnNameResolver
    {
        string ResolveColumnName(PropertyInfo propertyInfo);
    }
}