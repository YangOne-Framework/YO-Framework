--[dbo].[usp_Menu_GetAdminAllByRole] 'SuperAdmin'
CREATE OR ALTER PROCEDURE [dbo].[usp_Menu_GetAdminAllByRole]
    @RoleNames NVARCHAR(MAX)
AS
SET NOCOUNT ON
    SELECT DISTINCT m.MenuId, m.Name, m.SubTitle, m.Url, m.Icon, m.CssClass,
           m.IsChild, m.ParentId, m.MenuOrder, m.MenuGroupId, m.Culture,
           m.IsBackend, m.IsSystem, m.IsActive
    FROM dbo.Menu m
    INNER JOIN dbo.MenuPermission mp ON mp.MenuId = m.MenuId
    INNER JOIN dbo.IdentityRole r ON r.Id = mp.RoleId
    WHERE m.MenuGroupId = 1
      AND m.IsBackend = 1
      AND m.IsActive = 1
      AND m.IsDeleted = 0
      AND mp.AllowAccess = 1
      AND r.Name IN (SELECT items FROM dbo.udf_Split(@RoleNames, ','))
    ORDER BY m.ParentId, m.MenuOrder
SET NOCOUNT OFF
