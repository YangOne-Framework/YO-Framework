// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using YangOne.Data.Crud;

namespace YangOne.Web.Dto
{
    /// <summary>
    /// View model for the application installer, containing database connection settings.
    /// </summary>
    public class InstallationInfo
    {
        public string DatabaseServer { get; set; }
        public string DatabaseName { get; set; }
        public string DatabaseUser { get; set; }
        public string DatabasePassword { get; set; }

        public string DatabaseProvider { get; set; } = "SQLServer";
        public string ConnectionStrings { get; set; }
        public int Port { get; set; } = 1433;


        public override string ToString()
        {
            string msSqlConnectionString = $"Server={this.DatabaseServer},{this.Port};Database={this.DatabaseName};Persist Security Info=False;User ID={this.DatabaseUser};Password={this.DatabasePassword};MultipleActiveResultSets=true;Connection Timeout=30;Trust Server Certificate=True;";
            string npgSqlConnectionString = $"Server={this.DatabaseServer};Port={this.Port};Database={this.DatabaseName};User Id={this.DatabaseUser};Password={this.DatabasePassword};CommandTimeout=30";

            if (!string.IsNullOrEmpty(ConnectionStrings))
            {
                return this.ConnectionStrings;
            }
            else
            {
                var dialect = (Dialect)Enum.Parse(typeof(Dialect), this.DatabaseProvider);
                switch (dialect)
                {
                    case Dialect.SQLServer:
                        return msSqlConnectionString;
                    case Dialect.PostgreSQL:
                        return npgSqlConnectionString;
                }
                return "";
            }

        }
        public string Framework { get; set; }


    }
}

