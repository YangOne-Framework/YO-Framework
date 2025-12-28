namespace YangOne.Configuration
{
    public interface IConfigToJson
    {
        bool SaveConnectionString(YangOneConnectionStrings connectionString);
        bool SaveKachuwaConfig(YangOneAppConfig config);
    }
}