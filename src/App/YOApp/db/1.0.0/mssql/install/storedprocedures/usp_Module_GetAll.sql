CREATE OR ALTER PROCEDURE [dbo].[usp_Module_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM dbo.Module
    WHERE IsDeleted = 0
    ORDER BY Name;
END
