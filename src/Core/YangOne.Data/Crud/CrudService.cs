// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using YangOne.Data.Crud;

namespace YangOne.Data
{
    /// <summary>
    /// Generic CRUD (Create, Read, Update, Delete) service for database operations.
    /// Provides a high-level abstraction over Dapper for common data access patterns.
    /// </summary>
    /// <typeparam name="T">The entity type this service operates on. Must have a parameterless constructor.</typeparam>
    /// <remarks>
    /// <para>
    /// This service uses the <see cref="IDatabaseFactory"/> to create database connections,
    /// allowing it to work with different database providers (SQL Server, PostgreSQL, etc.)
    /// through the <see cref="Dialect"/> configuration.
    /// </para>
    /// <para>
    /// Usage: Inject via dependency injection or instantiate directly with a custom IDatabaseFactory.
    /// All methods automatically open and close connections, making them safe for use in
    /// request-scoped contexts like ASP.NET Core controllers.
    /// </para>
    /// <para>
    /// Thread Safety: This class is not thread-safe. Create a new instance per request/scope.
    /// </para>
    /// </remarks>
    public class CrudService<T>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="CrudService{T}"/> class with a custom database factory.
        /// </summary>
        /// <param name="dbFactory">The database factory to use for creating connections. Use this for testing or custom configurations.</param>
        public CrudService(IDatabaseFactory dbFactory)
        {
            DbFactory = dbFactory;
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="CrudService{T}"/> class using the default database factory.
        /// </summary>
        /// <remarks>
        /// Uses <see cref="DbFactoryProvider.GetFactory()"/> which reads the configured <see cref="Dialect"/>
        /// from application settings. This is the standard constructor for production use.
        /// </remarks>
        public CrudService()
        {
            DbFactory = DbFactoryProvider.GetFactory();
        }

        /// <summary>
        /// Gets the database factory used to create connections.
        /// </summary>
        private IDatabaseFactory DbFactory { get; }
        //public Task<int> SaveAsync(T t)
        //{
        //    using (var db = DbFactory.Open())
        //    {
        //        var x = await db.GetListAsync<T>();

        //    }
        //}

        /// <summary>
        /// Executes a raw SQL query and returns the first result.
        /// </summary>
        /// <param name="sql">The SQL query to execute (e.g., "SELECT * FROM Users WHERE Email = @Email").</param>
        /// <param name="param">Anonymous object or Dapper DynamicParameters for parameterized queries.</param>
        /// <returns>The first matching entity, or default(T) if no results.</returns>
        /// <remarks>
        /// Use for custom queries that don't fit standard CRUD patterns. 
        /// Always use parameterized queries to prevent SQL injection.
        /// </remarks>
        public virtual T Query(string sql, object param = null)
        {
            using (var db = (DbConnection)DbFactory.GetConnection())
            {
                db.Open();
                var result = db.Query<T>(sql, param);
                db.Close();
                return result.FirstOrDefault();
            }
        }

        /// <summary>
        /// Asynchronously executes a raw SQL query and returns the first result.
        /// </summary>
        /// <param name="sql">The SQL query to execute.</param>
        /// <param name="param">Anonymous object or Dapper DynamicParameters for parameterized queries.</param>
        /// <returns>A task representing the async operation, containing the first matching entity or default(T).</returns>
        /// <remarks>
        /// Preferred over synchronous version for ASP.NET Core applications to avoid thread pool blocking.
        /// </remarks>
        public virtual async Task<T> QueryAsync(string sql, object param = null)
        {
            using (var db = (DbConnection)DbFactory.GetConnection())
            {
                await db.OpenAsync();
                var result = await db.QueryAsync<T>(sql, param);
                db.Close();
                return result.FirstOrDefault();

            }
        }

        /// <summary>
        /// Executes a raw SQL query and returns all results as a collection.
        /// </summary>
        /// <param name="sql">The SQL query to execute.</param>
        /// <param name="param">Anonymous object or Dapper DynamicParameters for parameterized queries.</param>
        /// <returns>All matching entities, or empty collection if no results.</returns>
        /// <remarks>
        /// Use when you need multiple results from a custom query.
        /// </remarks>
        public virtual IEnumerable<T> QueryList(string sql, object param = null)
        {
            using (var db = (DbConnection)DbFactory.GetConnection())
            {
                db.Open();
                return db.Query<T>(sql, param);
            }
        }

        /// <summary>
        /// Asynchronously executes a raw SQL query and returns all results as a collection.
        /// </summary>
        /// <param name="sql">The SQL query to execute.</param>
        /// <param name="param">Anonymous object or Dapper DynamicParameters for parameterized queries.</param>
        /// <returns>A task representing the async operation, containing all matching entities.</returns>
        public virtual async Task<IEnumerable<T>> QueryListAsync(string sql, object param = null)
        {
            using (var db = (DbConnection)DbFactory.GetConnection())
            {
                await db.OpenAsync();
                return await db.QueryAsync<T>(sql, param);

            }
        }
        /// <summary>
        /// Retrieves a single entity by its primary key.
        /// </summary>
        /// <param name="id">The primary key value of the entity to retrieve.</param>
        /// <returns>The entity if found, otherwise default(T).</returns>
        /// <remarks>
        /// Uses Dapper's Get extension which generates a SELECT by primary key automatically.
        /// The entity type T must have a property marked with [Key] attribute.
        /// </remarks>
        public virtual T Get(object id)
        {
            using (var db = (DbConnection)DbFactory.GetConnection())
            {
                db.Open();
                return db.Get<T>(id);

            }
        }

        /// <summary>
        /// Asynchronously retrieves a single entity by its primary key.
        /// </summary>
        /// <param name="id">The primary key value of the entity to retrieve.</param>
        /// <returns>A task representing the async operation, containing the entity if found.</returns>
        public virtual async Task<T> GetAsync(object id)
        {
            using (var db = (DbConnection)DbFactory.GetConnection())
            {
                await db.OpenAsync();
                return await db.GetAsync<T>(id);

            }
        }

        /// <summary>
        /// Retrieves a single entity matching a custom WHERE condition.
        /// </summary>
        /// <param name="condition">WHERE clause without the WHERE keyword (e.g., "Email = @Email AND IsActive = 1").</param>
        /// <param name="parameters">Anonymous object with parameter values.</param>
        /// <returns>The first matching entity, or default(T) if none found.</returns>
        /// <remarks>
        /// Useful for lookups by non-primary-key fields like email, username, or slug.
        /// </remarks>
        public virtual T Get(string condition, object parameters = null)
        {
            using (var db = (DbConnection)DbFactory.GetConnection())
            {
                db.Open();
                return db.Get<T>(condition, parameters);

            }
        }

        /// <summary>
        /// Asynchronously retrieves a single entity matching a custom WHERE condition.
        /// </summary>
        /// <param name="condition">WHERE clause without the WHERE keyword.</param>
        /// <param name="parameters">Anonymous object with parameter values.</param>
        /// <returns>A task representing the async operation, containing the matching entity.</returns>
        public virtual async Task<T> GetAsync(string condition, object parameters = null)
        {
            using (var db = (DbConnection)DbFactory.GetConnection())
            {
                await db.OpenAsync();
                return await db.GetAsync<T>(condition, parameters);

            }
        }

        /// <summary>
        /// Retrieves all entities matching the specified where conditions object.
        /// </summary>
        /// <param name="whereConditions">Anonymous object representing WHERE conditions (e.g., new { IsActive = true, RoleId = 5 }).</param>
        /// <returns>Collection of matching entities.</returns>
        /// <remarks>
        /// Dapper automatically converts the object properties to WHERE column = @property clauses.
        /// </remarks>
        public virtual IEnumerable<T> GetList(object whereConditions)
        {
            {
                using (var db = (DbConnection)DbFactory.GetConnection())
                {
                    db.Open();
                    return db.GetList<T>(whereConditions);

                }
            }
        }

        /// <summary>
        /// Asynchronously retrieves all entities matching the specified where conditions object.
        /// </summary>
        /// <param name="whereConditions">Anonymous object representing WHERE conditions.</param>
        /// <returns>A task representing the async operation, containing matching entities.</returns>
        public virtual async Task<IEnumerable<T>> GetListAsync(object whereConditions)
        {
            {
                using (var db = (DbConnection)DbFactory.GetConnection())
                {
                    await db.OpenAsync();
                    return await db.GetListAsync<T>(whereConditions);

                }
            }
        }

        /// <summary>
        /// Retrieves all entities matching a custom WHERE clause with parameters.
        /// </summary>
        /// <param name="conditions">WHERE clause without the WHERE keyword (e.g., "CreatedDate &gt; @Date AND Status = @Status").</param>
        /// <param name="parameters">Anonymous object with parameter values.</param>
        /// <returns>Collection of matching entities.</returns>
        /// <remarks>
        /// Use for complex queries that can't be expressed with the simple whereConditions object.
        /// </remarks>
        public virtual IEnumerable<T> GetList(string conditions,
           object parameters)
        {
            {
                using (var db = (DbConnection)DbFactory.GetConnection())
                {
                    db.Open();
                    return db.GetList<T>(conditions, parameters);

                }
            }
        }

        /// <summary>
        /// Asynchronously retrieves all entities matching a custom WHERE clause with parameters.
        /// </summary>
        /// <param name="conditions">WHERE clause without the WHERE keyword.</param>
        /// <param name="parameters">Anonymous object with parameter values.</param>
        /// <returns>A task representing the async operation, containing matching entities.</returns>
        public virtual async Task<IEnumerable<T>> GetListAsync(string conditions,
            object parameters)
        {
            {
                using (var db = (DbConnection)DbFactory.GetConnection())
                {
                    await db.OpenAsync();
                    return await db.GetListAsync<T>(conditions, parameters);

                }
            }
        }

        /// <summary>
        /// Retrieves entities with joined table data using a custom query.
        /// </summary>
        /// <param name="conditions">WHERE clause for filtering joined results.</param>
        /// <param name="parameters">Parameters for the WHERE clause.</param>
        /// <returns>Collection of entities with joined data populated.</returns>
        /// <remarks>
        /// Requires the entity to have properties mapped with [Join] attributes for related tables.
        /// Useful for loading entity with related data in a single query (eager loading).
        /// </remarks>
        public virtual async Task<IEnumerable<T>> GetJoinedList(string conditions,
           object parameters = null)
        {
            {
                using (var db = (DbConnection)DbFactory.GetConnection())
                {
                    await db.OpenAsync();
                    return await db.GetJoinedList<T>(conditions, parameters);

                }
            }
        }

        /// <summary>
        /// Retrieves all entities of type T from the database.
        /// </summary>
        /// <returns>All entities, or empty collection if table is empty.</returns>
        /// <remarks>
        /// Warning: This loads the entire table into memory. Use with caution on large tables.
        /// Consider using GetListPaged for large datasets.
        /// </remarks>
        public virtual IEnumerable<T> GetList()
        {
            {
                using (var db = (DbConnection)DbFactory.GetConnection())
                {
                    db.Open();
                    return db.GetList<T>();

                }
            }
        }

        /// <summary>
        /// Asynchronously retrieves all entities of type T from the database.
        /// </summary>
        /// <returns>A task representing the async operation, containing all entities.</returns>
        /// <remarks>
        /// Warning: This loads the entire table into memory. Use GetListPagedAsync for large datasets.
        /// </remarks>
        public virtual async Task<IEnumerable<T>> GetListAsync()
        {
            {
                using (var db = (DbConnection)DbFactory.GetConnection())
                {
                    await db.OpenAsync();
                    return await db.GetListAsync<T>();

                }
            }
        }

        /// <summary>
        /// Retrieves a paginated list of entities with optional filtering and sorting.
        /// </summary>
        /// <param name="pageNumber">The page number (1-based).</param>
        /// <param name="rowsPerPage">Number of rows per page.</param>
        /// <param name="pageSize">Total page size for calculation (usually same as rowsPerPage).</param>
        /// <param name="conditions">Optional WHERE clause for filtering.</param>
        /// <param name="orderby">ORDER BY clause (e.g., "CreatedDate DESC").</param>
        /// <param name="parameters">Parameters for the WHERE clause.</param>
        /// <returns>Entities for the requested page.</returns>
        /// <remarks>
        /// Use for grid/list UI with pagination. The database handles LIMIT/OFFSET for efficiency.
        /// </remarks>
        public virtual IEnumerable<T> GetListPaged(int pageNumber, int rowsPerPage,
           int pageSize, string conditions, string orderby, object parameters = null)
        {
            {
                using (var db = (DbConnection)DbFactory.GetConnection())
                {
                    db.Open();
                    return db.GetListPaged<T>(pageNumber, rowsPerPage, pageSize, conditions, orderby, parameters);

                }
            }
        }

        /// <summary>
        /// Asynchronously retrieves a paginated list of entities with optional filtering and sorting.
        /// </summary>
        /// <param name="pageNumber">The page number (1-based).</param>
        /// <param name="rowsPerPage">Number of rows per page.</param>
        /// <param name="pageSize">Total page size for calculation.</param>
        /// <param name="conditions">Optional WHERE clause for filtering.</param>
        /// <param name="orderby">ORDER BY clause (e.g., "CreatedDate DESC").</param>
        /// <param name="parameters">Parameters for the WHERE clause.</param>
        /// <returns>A task representing the async operation, containing entities for the requested page.</returns>
        public virtual async Task<IEnumerable<T>> GetListPagedAsync(int pageNumber, int rowsPerPage,
            int pageSize, string conditions, string orderby, object parameters = null)
        {
            {
                using (var db = (DbConnection)DbFactory.GetConnection())
                {
                    await db.OpenAsync();
                    return await db.GetListPagedAsync<T>(pageNumber, rowsPerPage, pageSize, conditions, orderby, parameters);

                }
            }
        }

        /// <summary>
        /// Inserts a new entity and returns the auto-generated identity value.
        /// </summary>
        /// <param name="entityToInsert">The entity to insert. Primary key should be 0 or default for auto-generation.</param>
        /// <returns>The inserted entity's primary key value, or null if not available.</returns>
        /// <remarks>
        /// The entity's primary key property (marked with [Key]) will be populated with the generated value
        /// if the database supports identity/sequence columns (SQL Server, PostgreSQL).
        /// </remarks>
        public virtual int? Insert(object entityToInsert)
        {
            {
                using (var db = (DbConnection)DbFactory.GetConnection())
                {
                    db.Open();
                    return db.Insert<int?>(entityToInsert);

                }
            }
        }
        /// <summary>
        /// Asynchronously inserts a new entity and returns the auto-generated identity value.
        /// </summary>
        /// <param name="entityToInsert">The entity to insert.</param>
        /// <returns>A task representing the async operation, containing the inserted entity's primary key.</returns>
        public virtual async Task<int?> InsertAsync(object entityToInsert)
        {
            {
                using (var db = (DbConnection)DbFactory.GetConnection())
                {
                    await db.OpenAsync();
                    return await db.InsertAsync<int?>(entityToInsert);

                }
            }
        }

        /// <summary>
        /// Inserts a new entity and returns the auto-generated identity value of the specified type.
        /// </summary>
        /// <typeparam name="TKey">The type of the primary key (e.g., int, long, Guid).</typeparam>
        /// <param name="entityToInsert">The entity to insert.</param>
        /// <returns>The inserted entity's primary key value.</returns>
        /// <remarks>
        /// Use when the primary key is not an int (e.g., Guid, long). The entity's key property will be populated.
        /// </remarks>
        public virtual TKey Insert<TKey>(object entityToInsert)
        {
            using (var db = (DbConnection)DbFactory.GetConnection())
            {
                db.Open();
                return db.Insert<TKey>(entityToInsert);

            }
        }

        /// <summary>
        /// Asynchronously inserts a new entity and returns the auto-generated identity value of the specified type.
        /// </summary>
        /// <typeparam name="TKey">The type of the primary key (e.g., int, long, Guid).</typeparam>
        /// <param name="entityToInsert">The entity to insert.</param>
        /// <returns>A task representing the async operation, containing the inserted entity's primary key.</returns>
        public virtual async Task<TKey> InsertAsync<TKey>(object entityToInsert)
        {
            {
                using (var db = (DbConnection)DbFactory.GetConnection())
                {
                    await db.OpenAsync();
                    return await db.InsertAsync<TKey>(entityToInsert);

                }
            }
        }

        /// <summary>
        /// Asynchronously inserts an entity within an existing transaction.
        /// </summary>
        /// <typeparam name="TKey">The type of the primary key.</typeparam>
        /// <param name="db">The existing database connection.</param>
        /// <param name="entityToInsert">The entity to insert.</param>
        /// <param name="transaction">The transaction to participate in.</param>
        /// <param name="commandTimeout">Optional command timeout in seconds.</param>
        /// <returns>A task representing the async operation, containing the inserted entity's primary key.</returns>
        /// <remarks>
        /// Use for bulk operations or when multiple inserts must be atomic.
        /// The caller is responsible for opening/closing the connection and committing/rolling back the transaction.
        /// </remarks>
        public virtual async Task<TKey> InsertAsync<TKey>(IDbConnection db, object entityToInsert, IDbTransaction transaction, int? commandTimeout)
        {
            {

                return await db.InsertAsync<TKey>(entityToInsert, transaction, commandTimeout);

            }
        }

        /// <summary>
        /// Updates an existing entity by primary key.
        /// </summary>
        /// <param name="entityToUpdate">The entity with updated values. Primary key must be set.</param>
        /// <returns>Number of rows affected (typically 1).</returns>
        /// <remarks>
        /// Updates all non-key properties. The entity must have a [Key] attribute on its primary key property.
        /// </remarks>
        public virtual int Update(object entityToUpdate)
        {
            {
                using (var db = (DbConnection)DbFactory.GetConnection())
                {
                    db.Open();
                    return db.Update(entityToUpdate);

                }
            }
        }

        /// <summary>
        /// Updates an entity within an existing transaction.
        /// </summary>
        /// <param name="db">The existing database connection.</param>
        /// <param name="entityToUpdate">The entity with updated values.</param>
        /// <param name="transaction">The transaction to participate in.</param>
        /// <param name="timeout">Optional command timeout in seconds.</param>
        /// <returns>Number of rows affected.</returns>
        public virtual int Update(IDbConnection db, object entityToUpdate, IDbTransaction transaction, int? timeout)
        {
            {

                return db.Update(entityToUpdate, transaction, timeout);


            }
        }

        /// <summary>
        /// Asynchronously updates an entity within an existing transaction.
        /// </summary>
        /// <param name="db">The existing database connection.</param>
        /// <param name="entityToUpdate">The entity with updated values.</param>
        /// <param name="transaction">The transaction to participate in.</param>
        /// <param name="commandTimeout">Optional command timeout in seconds.</param>
        /// <returns>A task representing the async operation, containing rows affected.</returns>
        public virtual async Task<int> UpdateAsync(IDbConnection db, object entityToUpdate, IDbTransaction transaction, int? commandTimeout)
        {
            {

                return await db.UpdateAsync(entityToUpdate, transaction, commandTimeout);


            }
        }

        /// <summary>
        /// Asynchronously updates an entity matching a custom WHERE condition.
        /// </summary>
        /// <param name="entityToUpdate">The entity with updated values.</param>
        /// <param name="condition">WHERE clause without the WHERE keyword.</param>
        /// <param name="paramters">Parameters for the WHERE clause.</param>
        /// <returns>A task representing the async operation.</returns>
        /// <remarks>
        /// Useful for updating entities without loading them first (e.g., batch updates).
        /// </remarks>
        public async Task UpdateAsync(object entityToUpdate, string condition, object paramters = null)
        {
            using (var db = (DbConnection)DbFactory.GetConnection())
            {
                await db.OpenAsync();
                await db.UpdateAsync(entityToUpdate, condition, paramters);

            }
        }

        /// <summary>
        /// Asynchronously updates an entity by primary key.
        /// </summary>
        /// <param name="entityToUpdate">The entity with updated values. Primary key must be set.</param>
        /// <returns>A task representing the async operation, containing true if successful.</returns>
        public virtual async Task<bool> UpdateAsync(object entityToUpdate)
        {

            using (var db = (DbConnection)DbFactory.GetConnection())
            {
                await db.OpenAsync();
                await db.UpdateAsync(entityToUpdate);
                return await Task.FromResult(true);
            }

        }
        /// <summary>
        /// Deletes an entity by its primary key (loaded in the entity).
        /// </summary>
        /// <param name="entityToDelete">The entity to delete. Primary key must be set.</param>
        /// <returns>Number of rows affected (typically 1).</returns>
        public virtual int Delete(T entityToDelete)
        {
            {
                using (var db = (DbConnection)DbFactory.GetConnection())
                {
                    db.Open();
                    return db.Delete(entityToDelete);

                }
            }
        }

        /// <summary>
        /// Asynchronously deletes an entity by its primary key (loaded in the entity).
        /// </summary>
        /// <param name="entityToDelete">The entity to delete. Primary key must be set.</param>
        /// <returns>A task representing the async operation, containing rows affected.</returns>
        public virtual async Task<int> DeleteAsync(T entityToDelete)
        {
            {
                using (var db = (DbConnection)DbFactory.GetConnection())
                {
                    await db.OpenAsync();
                    return await db.DeleteAsync(entityToDelete);

                }
            }
        }

        /// <summary>
        /// Deletes an entity by its primary key value.
        /// </summary>
        /// <param name="id">The primary key value of the entity to delete.</param>
        /// <returns>Number of rows affected.</returns>
        /// <remarks>
        /// Use when you only have the ID and don't want to load the full entity first.
        /// </remarks>
        public virtual int Delete(object id)
        {
            {
                using (var db = (DbConnection)DbFactory.GetConnection())
                {
                    db.Open();
                    return db.Delete<T>(id);

                }
            }
        }

        /// <summary>
        /// Deletes an entity by primary key within an existing transaction.
        /// </summary>
        /// <param name="db">The existing database connection.</param>
        /// <param name="id">The primary key value of the entity to delete.</param>
        /// <param name="transaction">The transaction to participate in.</param>
        /// <param name="timeout">Optional command timeout in seconds.</param>
        /// <returns>Number of rows affected.</returns>
        public virtual int Delete(IDbConnection db, object id, IDbTransaction transaction, int? timeout)
        {

            return db.Delete(id, transaction, timeout);
        }

        /// <summary>
        /// Asynchronously deletes an entity by its primary key value.
        /// </summary>
        /// <param name="id">The primary key value of the entity to delete.</param>
        /// <returns>A task representing the async operation, containing rows affected.</returns>
        public virtual async Task<int> DeleteAsync(object id)
        {
            using (var db = (DbConnection)DbFactory.GetConnection())
            {
                await db.OpenAsync();
                return await db.DeleteAsync<T>(id);

            }

        }

        /// <summary>
        /// Asynchronously deletes an entity by primary key within an existing transaction.
        /// </summary>
        /// <param name="db">The existing database connection.</param>
        /// <param name="id">The primary key value of the entity to delete.</param>
        /// <param name="transaction">The transaction to participate in.</param>
        /// <param name="timeout">Optional command timeout in seconds.</param>
        /// <returns>A task representing the async operation, containing rows affected.</returns>
        public virtual async Task<int> DeleteAsync(IDbConnection db, object id, IDbTransaction transaction, int? timeout)
        {
            return await db.DeleteAsync(id, transaction, timeout);
        }

        /// <summary>
        /// Deletes multiple entities by their primary keys.
        /// </summary>
        /// <param name="ids">Array of primary key values to delete.</param>
        /// <returns>Number of rows affected.</returns>
        /// <remarks>
        /// Efficiently deletes multiple entities in a single operation using WHERE IN clause.
        /// </remarks>
        public virtual int Delete(int[] ids)
        {
            {
                using (var db = (DbConnection)DbFactory.GetConnection())
                {
                    db.Open();
                    return db.Delete<T>(ids);

                }
            }
        }

        /// <summary>
        /// Asynchronously deletes multiple entities by their primary keys.
        /// </summary>
        /// <param name="ids">Array of primary key values to delete.</param>
        /// <returns>A task representing the async operation, containing rows affected.</returns>
        public virtual async Task<int> DeleteAsync(int[] ids)
        {

            using (var db = (DbConnection)DbFactory.GetConnection())
            {
                await db.OpenAsync();
                return await db.DeleteAsync<T>(ids);

            }

        }

        /// <summary>
        /// Asynchronously deletes entities matching a custom WHERE condition.
        /// </summary>
        /// <param name="condition">WHERE clause without the WHERE keyword.</param>
        /// <param name="parameters">Parameters for the WHERE clause.</param>
        /// <returns>A task representing the async operation.</returns>
        /// <remarks>
        /// Use for bulk deletions based on criteria (e.g., "CreatedDate < @Date").
        /// Warning: This can delete many rows. Use with caution.
        /// </remarks>
        public virtual async Task DeleteAsync(string condition, object parameters = null)
        {
            using (var db = (DbConnection)DbFactory.GetConnection())
            {
                await db.OpenAsync();
                await db.DeleteAsync<T>(condition, parameters);
            }
        }

        /// <summary>
        /// Asynchronously deletes entities matching a condition within an existing transaction.
        /// </summary>
        /// <param name="db">The existing database connection.</param>
        /// <param name="transaction">The transaction to participate in.</param>
        /// <param name="condition">WHERE clause without the WHERE keyword.</param>
        /// <param name="parameters">Parameters for the WHERE clause.</param>
        /// <param name="timeout">Optional command timeout in seconds.</param>
        /// <returns>A task representing the async operation.</returns>
        public virtual async Task DeleteAsync(IDbConnection db, IDbTransaction transaction, string condition, object parameters, int? timeout)
        {
            await db.DeleteAsync<T>(condition, parameters, transaction, timeout);
        }

        // int DeleteList(object whereConditions);

        /// <summary>
        /// Asynchronously deletes entities matching the specified where conditions object.
        /// </summary>
        /// <param name="whereConditions">Anonymous object representing WHERE conditions (e.g., new { IsActive = false, Status = "Deleted" }).</param>
        /// <returns>A task representing the async operation, containing number of rows deleted.</returns>
        /// <remarks>
        /// Dapper automatically converts the object properties to WHERE column = @property clauses.
        /// </remarks>
        public virtual async Task<int> DeleteListAsync(object whereConditions)
        {
            {
                using (var db = (DbConnection)DbFactory.GetConnection())
                {
                    await db.OpenAsync();
                    return await db.DeleteListAsync<T>(whereConditions);

                }
            }
        }

        /// <summary>
        /// Asynchronously deletes entities matching a custom WHERE clause with parameters.
        /// </summary>
        /// <param name="conditions">WHERE clause without the WHERE keyword.</param>
        /// <param name="parameters">Parameters for the WHERE clause.</param>
        /// <returns>A task representing the async operation, containing number of rows deleted.</returns>
        public virtual async Task<int> DeleteListAsync(string conditions,
            object parameters = null)
        {
            {
                using (var db = (DbConnection)DbFactory.GetConnection())
                {
                    await db.OpenAsync();
                    return await db.DeleteListAsync<T>(conditions, parameters);

                }
            }
        }

        public virtual async Task<int> RecordCountAsync(string conditions = "",
            object parameters = null)
        {
            {
                using (var db = (DbConnection)DbFactory.GetConnection())
                {
                    await db.OpenAsync();
                    return await db.RecordCountAsync<T>(conditions, parameters);

                }
            }
        }
        public virtual async Task<int> RecordCountAsync(object whereConditions)
        {
            {
                using (var db = (DbConnection)DbFactory.GetConnection())
                {
                    await db.OpenAsync();
                    return await db.RecordCountAsync<T>(whereConditions);

                }
            }
        }

        public virtual async Task<object> GetDependents()
        {
            {
                using (var db = (DbConnection)DbFactory.GetConnection())
                {
                    await db.OpenAsync();
                    return await db.GetDependents<T>();
                }
            }
        }



        public virtual async Task UpdateAsDeleted(object id)
        {
            using (var db = (DbConnection)DbFactory.GetConnection())
            {
                await db.OpenAsync();
                await db.UpdateAsDeleted<T>(id);
            }
        }
        public virtual async Task UpdateAsDeleted(string conditions = "",
            object parameters = null)
        {
            using (var db = (DbConnection)DbFactory.GetConnection())
            {
                await db.OpenAsync();
                await db.UpdateAsDeleted<T>(conditions, parameters);
            }
        }

        public virtual async Task<int> UpdateStatusAsync(object id, object status)
        {
            using (var db = (DbConnection)DbFactory.GetConnection())
            {
                await db.OpenAsync();
                return await db.UpdateStatus<T>(id, status);
            }
        }
        public virtual async Task<int> UpdateStatusByColumnName(object id, object status, string columnName)
        {
            using (var db = (DbConnection)DbFactory.GetConnection())
            {
                await db.OpenAsync();
                return await db.UpdateStatusByColumnName<T>(id, status, columnName);
            }
        }
    }
}
