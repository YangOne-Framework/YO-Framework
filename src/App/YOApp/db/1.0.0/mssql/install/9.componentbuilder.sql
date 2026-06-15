ALTER TABLE dbo.HtmlComponent
ADD
    StateSchema NVARCHAR(MAX) NULL,
    ApiBindings NVARCHAR(MAX) NULL,
    EventBindings NVARCHAR(MAX) NULL,
    RuntimeOptions NVARCHAR(MAX) NULL,
    Version NVARCHAR(50) NULL;
