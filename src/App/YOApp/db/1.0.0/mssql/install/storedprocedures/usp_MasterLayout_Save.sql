CREATE OR ALTER PROCEDURE dbo.usp_MasterLayout_Save
    @MasterLayoutUniqueId     NVARCHAR(128),
    @Name                       NVARCHAR(256),
    @Description                NVARCHAR(max) = NULL,
    @HasHeader                  BIT = 1,
    @HasFooter                  BIT = 1,
    @Sidebar                    NVARCHAR(20) = 'none',
    @IsSystem                   BIT = 0,
    @LayoutConfig               NVARCHAR(max) = NULL,
    @UpdatedBy                  BIGINT = 0
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ExistingId BIGINT;

    SELECT @ExistingId = MasterLayoutID
    FROM dbo.MasterLayout
    WHERE MasterLayoutUniqueId = @MasterLayoutUniqueId AND IsDeleted = 0;

    IF @ExistingId IS NULL
    BEGIN
        INSERT INTO dbo.MasterLayout (
            MasterLayoutUniqueId, Name, Description,
            HasHeader, HasFooter, Sidebar, IsSystem,
            LayoutConfig,
            AddedBy, UpdatedBy
        ) VALUES (
            @MasterLayoutUniqueId, @Name, @Description,
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
        WHERE MasterLayoutID = @ExistingId;

        SELECT @ExistingId AS MasterLayoutID, 'updated' AS Action;
    END
END
