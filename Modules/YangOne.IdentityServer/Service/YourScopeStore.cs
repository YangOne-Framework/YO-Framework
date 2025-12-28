

using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using YangOne.Data;

namespace YangOne.IdentityServer.Service

{

    static class DbOpen
    {
        public static async Task<DbConnection> OpenAsync(CancellationToken ct)
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            var db = (DbConnection)dbFactory.GetConnection();
            await db.OpenAsync(ct);
            return db;
        }
    }
}
