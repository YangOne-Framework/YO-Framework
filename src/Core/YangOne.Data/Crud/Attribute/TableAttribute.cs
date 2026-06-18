// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;

namespace YangOne.Data.Crud.Attribute
{
    [AttributeUsage(AttributeTargets.Class , AllowMultiple = true)]

    /// <summary>
    /// Specifies a JOIN relationship with another table for query building.
    /// </summary>
    public class JoinAttribute : System.Attribute
    {
        public Type TableName { get; set; }
        public string At { get; set; }
        public JoinType JoinType { get; set; } 
    }

    /// <summary>
    /// Specifies the type of JOIN for a <see cref="JoinAttribute"/>.
    /// </summary>
    public enum JoinType
    {
        InnerJoin,CrossJoin,LeftJoin,RightJoin,LeftOuterJoin,RightOuterJoin
    }
    /// <summary>
    /// Specifies that a property should be selected from a related table.
    /// </summary>
    public class GetFromAttribute : System.Attribute
    {
        public Type TableName { get; set; }
    }
    ///// <summary>
    ///// Optional Table attribute.
    ///// You can use the System.ComponentModel.DataAnnotations version in its place to specify the table name of a poco
    ///// </summary>
    //[AttributeUsage(AttributeTargets.Class)]
    //public class TableAttribute : System.Attribute
    //{
    //    /// <summary>
    //    /// Optional Table attribute.
    //    /// </summary>
    //    /// <param name="tableName"></param>
    //    public TableAttribute(string tableName)
    //    {
    //        Name = tableName;
    //    }
    //    /// <summary>
    //    /// Name of the table
    //    /// </summary>
    //    public string Name { get; private set; }
    //    /// <summary>
    //    /// Name of the schema
    //    /// </summary>
    //    public string Schema { get; set; }
    //}
}
