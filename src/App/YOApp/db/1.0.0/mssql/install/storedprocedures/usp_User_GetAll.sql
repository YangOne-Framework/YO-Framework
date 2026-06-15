--[dbo].[usp_User_GetAll]1,2,null,null,null,'2'
CREATE OR ALTER PROCEDURE [dbo].[usp_User_GetAll]
    @offset INT = 1,
    @limit INT = 10,
    @search NVARCHAR(256) = NULL,
    @Email NVARCHAR(256) = NULL,
    @Phone NVARCHAR(256) = NULL,
    @RoleIds NVARCHAR(256) = NULL -- Comma-separated list: '1,2'
AS
BEGIN
    SET NOCOUNT ON;

    -- Pagination Calculation
    DECLARE @StartRow INT = @Limit * (@offset - 1);

     ;WITH UserRoles AS (
        SELECT 
            iur.UserId,
            STUFF((
                SELECT ', ' + ir2.Name
                FROM dbo.IdentityUserRole iur2
                INNER JOIN dbo.IdentityRole ir2 ON ir2.Id = iur2.RoleId
                WHERE iur2.UserId = iur.UserId
                FOR XML PATH(''), TYPE
            ).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS RoleNames
        FROM dbo.IdentityUserRole iur
        GROUP BY iur.UserId
    )

    SELECT 
        COUNT(1) OVER() AS RowTotal,
        au.*,
        ur.RoleNames AS RoleName
    FROM 
        dbo.AppUser au
        LEFT JOIN UserRoles ur ON ur.UserId = au.IdentityUserId
    WHERE
        (@search ='' OR  @search IS NULL OR 
            au.FirstName LIKE '%' + @search + '%' OR
            au.LastName LIKE '%' + @search + '%' OR
            au.Email LIKE '%' + @search + '%' OR
            au.PhoneNumber LIKE '%' + @search + '%'
        )
        AND (@Email ='' OR @Email IS NULL OR au.Email = @Email)
        AND (@Phone ='' OR @Phone IS NULL OR au.PhoneNumber = @Phone)
        AND (
           @RoleIds ='' OR @RoleIds IS NULL OR EXISTS (
                SELECT 1 
                FROM dbo.IdentityUserRole iur
                WHERE iur.UserId = au.IdentityUserId 
                AND iur.RoleId IN (
                    SELECT items 
                    FROM dbo.udf_Split(@RoleIds, ',')
                )
            )
        )
    ORDER BY au.FirstName
    OFFSET @StartRow ROWS FETCH NEXT @Limit ROWS ONLY;
END
