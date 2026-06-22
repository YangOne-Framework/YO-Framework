IF OBJECT_ID(N'dbo.YO_ModuleSampleInventoryItem', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.YO_ModuleSampleInventoryItem
    (
        ItemId int IDENTITY(1,1) NOT NULL CONSTRAINT PK_YO_ModuleSampleInventoryItem PRIMARY KEY,
        Name nvarchar(128) NOT NULL,
        Quantity int NOT NULL CONSTRAINT DF_YO_ModuleSampleInventoryItem_Quantity DEFAULT(0),
        SchemaVersion nvarchar(16) NOT NULL CONSTRAINT DF_YO_ModuleSampleInventoryItem_SchemaVersion DEFAULT(N'1.0.0'),
        AddedOn datetime2(0) NOT NULL CONSTRAINT DF_YO_ModuleSampleInventoryItem_AddedOn DEFAULT(SYSUTCDATETIME())
    );
END;

IF NOT EXISTS (SELECT 1 FROM dbo.YO_ModuleSampleInventoryItem WHERE Name = N'Sample Widget')
BEGIN
    INSERT INTO dbo.YO_ModuleSampleInventoryItem (Name, Quantity, SchemaVersion)
    VALUES (N'Sample Widget', 5, N'1.0.0');
END;
