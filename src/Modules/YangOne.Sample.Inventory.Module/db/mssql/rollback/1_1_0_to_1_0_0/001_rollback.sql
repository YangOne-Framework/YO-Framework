IF OBJECT_ID(N'dbo.YO_ModuleSampleInventoryItem', N'U') IS NOT NULL
BEGIN
    DELETE FROM dbo.YO_ModuleSampleInventoryItem WHERE Name = N'Version 1.1 Seed';
    UPDATE dbo.YO_ModuleSampleInventoryItem SET SchemaVersion = N'1.0.0';

    IF COL_LENGTH(N'dbo.YO_ModuleSampleInventoryItem', N'UpgradedOn') IS NOT NULL
    BEGIN
        ALTER TABLE dbo.YO_ModuleSampleInventoryItem DROP COLUMN UpgradedOn;
    END;

    IF COL_LENGTH(N'dbo.YO_ModuleSampleInventoryItem', N'Sku') IS NOT NULL
    BEGIN
        ALTER TABLE dbo.YO_ModuleSampleInventoryItem DROP COLUMN Sku;
    END;
END;
