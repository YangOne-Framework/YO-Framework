-- ============================================================
-- Stored Procedure: usp_MasterLayout_Save
-- Description: Insert or update a master layout (upsert by LayoutGUID)
-- ============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.usp_MasterLayout_Save') AND type in (N'P', N'PC'))
    DROP PROCEDURE dbo.usp_MasterLayout_Save
GO

CREATE PROCEDURE dbo.usp_MasterLayout_Save
    @LayoutGUID     NVARCHAR(128),
    @Name           NVARCHAR(256),
    @Description    NVARCHAR(max) = NULL,
    @HasHeader      BIT = 1,
    @HasFooter      BIT = 1,
    @Sidebar        NVARCHAR(20) = 'none',
    @IsSystem       BIT = 0,
    @LayoutConfig   NVARCHAR(max) = NULL,
    @UpdatedBy      BIGINT = 0
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ExistingId BIGINT;

    SELECT @ExistingId = LayoutId
    FROM dbo.MasterLayout
    WHERE LayoutGUID = @LayoutGUID AND IsDeleted = 0;

    IF @ExistingId IS NULL
    BEGIN
        INSERT INTO dbo.MasterLayout (
            LayoutGUID, Name, Description,
            HasHeader, HasFooter, Sidebar, IsSystem,
            LayoutConfig,
            AddedBy, UpdatedBy
        ) VALUES (
            @LayoutGUID, @Name, @Description,
            @HasHeader, @HasFooter, @Sidebar, @IsSystem,
            @LayoutConfig,
            @UpdatedBy, @UpdatedBy
        );

        SELECT SCOPE_IDENTITY() AS LayoutId, 'inserted' AS Action;
    END
    ELSE
    BEGIN
        UPDATE dbo.MasterLayout
        SET
            Name          = @Name,
            Description   = @Description,
            HasHeader     = @HasHeader,
            HasFooter     = @HasFooter,
            Sidebar       = @Sidebar,
            LayoutConfig  = @LayoutConfig,
            UpdatedOn     = GETDATE(),
            UpdatedBy     = @UpdatedBy
        WHERE LayoutId = @ExistingId;

        SELECT @ExistingId AS LayoutId, 'updated' AS Action;
    END
END
GO
