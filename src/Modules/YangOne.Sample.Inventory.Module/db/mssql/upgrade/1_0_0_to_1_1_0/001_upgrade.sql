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

IF COL_LENGTH(N'dbo.YO_ModuleSampleInventoryItem', N'Sku') IS NULL
BEGIN
    ALTER TABLE dbo.YO_ModuleSampleInventoryItem ADD Sku nvarchar(64) NULL;
END;

IF COL_LENGTH(N'dbo.YO_ModuleSampleInventoryItem', N'UpgradedOn') IS NULL
BEGIN
    ALTER TABLE dbo.YO_ModuleSampleInventoryItem ADD UpgradedOn datetime2(0) NULL;
END;

EXEC(N'
UPDATE dbo.YO_ModuleSampleInventoryItem
SET Sku = COALESCE(Sku, CONCAT(N''SKU-'', RIGHT(CONCAT(N''0000'', ItemId), 4))),
    SchemaVersion = N''1.1.0'',
    UpgradedOn = COALESCE(UpgradedOn, SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM dbo.YO_ModuleSampleInventoryItem WHERE Name = N''Version 1.1 Seed'')
BEGIN
    INSERT INTO dbo.YO_ModuleSampleInventoryItem (Name, Quantity, SchemaVersion, Sku, UpgradedOn)
    VALUES (N''Version 1.1 Seed'', 11, N''1.1.0'', N''SKU-0110'', SYSUTCDATETIME());
END;
');
