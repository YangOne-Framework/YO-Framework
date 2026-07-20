CREATE OR ALTER PROCEDURE dbo.usp_YOTheme_Save
    @YOThemeUniqueId    NVARCHAR(128),
    @Name               NVARCHAR(200),
    @Slug               NVARCHAR(200),
    @Version            NVARCHAR(20),
    @Author             NVARCHAR(200) = NULL,
    @Description        NVARCHAR(1000) = NULL,
    @Tags               NVARCHAR(500) = NULL,
    @Screenshot         NVARCHAR(500) = NULL,
    @Config             NVARCHAR(MAX) = NULL,
    @IsSystem           BIT = 0,
    @ParentYOThemeId    BIGINT = NULL,
    @PackagePath        NVARCHAR(1024) = NULL,
    @PackageHash        NVARCHAR(128) = NULL,
    @UpdatedBy          BIGINT = 0
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @ExistingId BIGINT;

    SELECT @ExistingId = YOThemeId
    FROM dbo.YOTheme
    WHERE YOThemeUniqueId = @YOThemeUniqueId AND IsDeleted = 0;

    IF @ExistingId IS NULL
    BEGIN
        INSERT INTO dbo.YOTheme (
            YOThemeUniqueId, Name, Slug, [Version],
            Author, Description, Tags, Screenshot, Config,
            IsSystem, ParentYOThemeId, PackagePath, PackageHash,
            AddedBy, UpdatedBy
        ) VALUES (
            @YOThemeUniqueId, @Name, @Slug, @Version,
            @Author, @Description, @Tags, @Screenshot, @Config,
            @IsSystem, @ParentYOThemeId, @PackagePath, @PackageHash,
            @UpdatedBy, @UpdatedBy
        );
        SELECT SCOPE_IDENTITY() AS YOThemeId, 'inserted' AS Action;
    END
    ELSE
    BEGIN
        UPDATE dbo.YOTheme
        SET Name = @Name, Slug = @Slug, [Version] = @Version,
            Author = @Author, Description = @Description, Tags = @Tags,
            Screenshot = @Screenshot, Config = @Config, IsSystem = @IsSystem,
            ParentYOThemeId = @ParentYOThemeId, PackagePath = @PackagePath,
            PackageHash = @PackageHash, UpdatedOn = GETDATE(), UpdatedBy = @UpdatedBy
        WHERE YOThemeId = @ExistingId;
        SELECT @ExistingId AS YOThemeId, 'updated' AS Action;
    END
END;