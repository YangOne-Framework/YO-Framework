--[dbo].[usp_UserPermission_GetByUserId] 2
CREATE OR ALTER PROCEDURE [dbo].[usp_UserPermission_GetByUserId]
@UserId BIGINT

AS
SET NOCOUNT ON

DECLARE @HasRole TABLE (RoleId BIGINT);
INSERT INTO @HasRole (RoleId)
SELECT DISTINCT RoleId FROM dbo.IdentityUserRole WHERE UserId = @UserId;

DECLARE @IsSuperAdmin BIT = 0;
IF EXISTS (
    SELECT 1 FROM @HasRole hr
    INNER JOIN dbo.IdentityRole r ON r.Id = hr.RoleId
    WHERE r.Name = 'SuperAdmin'
)
    SET @IsSuperAdmin = 1;

DECLARE @RoleAllow TABLE (ApplicationControllerActionId INT PRIMARY KEY);
INSERT INTO @RoleAllow (ApplicationControllerActionId)
SELECT DISTINCT mrp.ApplicationControllerActionId
FROM dbo.MasterRolePermission mrp
INNER JOIN @HasRole hr ON mrp.RoleId = hr.RoleId
WHERE mrp.AllowAccess = 1 AND mrp.IsActive = 1 AND mrp.IsDeleted = 0;

SELECT
    a.ApplicationControllerActionId,
    a.ApplicationControllerId,
    a.ActionUrl,
    a.RouteUrl,
    a.FriendlyName AS FriendlyUrl,
    c.Name AS ControllerName,
    @UserId AS UserId,
    0 AS UserPermissionId,
    ISNULL(up.AllowAccess, 0) AS AllowAccess,
    CASE WHEN up.UserPermissionId IS NULL THEN CAST(0 AS BIT) ELSE CAST(1 AS BIT) END AS HasUserOverride,
    up.AllowAccess AS UserOverrideAccess,
    CASE
        WHEN @IsSuperAdmin = 1 THEN CAST(1 AS BIT)
        WHEN ra.ApplicationControllerActionId IS NULL THEN CAST(0 AS BIT)
        ELSE CAST(1 AS BIT)
    END AS RoleAllowAccess,
    CASE
        WHEN @IsSuperAdmin = 1 THEN CAST(1 AS BIT)
        WHEN up.UserPermissionId IS NOT NULL THEN up.AllowAccess
        WHEN ra.ApplicationControllerActionId IS NOT NULL THEN CAST(1 AS BIT)
        ELSE CAST(0 AS BIT)
    END AS EffectiveAccess
FROM dbo.ApplicationControllerAction a
INNER JOIN dbo.ApplicationController c ON a.ApplicationControllerId = c.ApplicationControllerId
LEFT JOIN dbo.UserPermission up
    ON up.ApplicationControllerActionId = a.ApplicationControllerActionId
    AND up.UserId = @UserId
    AND up.IsActive = 1
    AND up.IsDeleted = 0
LEFT JOIN @RoleAllow ra
    ON ra.ApplicationControllerActionId = a.ApplicationControllerActionId
ORDER BY c.Name ASC, a.RouteUrl ASC

SET NOCOUNT OFF
