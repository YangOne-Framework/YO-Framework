CREATE OR ALTER PROCEDURE [dbo].[usp_ModuleOperationJournal_GetByModule]
    @ModuleName nvarchar(256),
    @Count int = 50
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (@Count) *
    FROM dbo.ModuleOperationJournal
    WHERE ModuleName = @ModuleName
    ORDER BY StartedOn DESC;
END
