using System;

namespace YangOne.Data.Crud
{
    public interface ITableNameResolver
    {
        string ResolveTableName(Type type);
    }
}