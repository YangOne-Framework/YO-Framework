namespace YangOne.Configuration
{
    public interface IConfigToJson
    {
        bool SaveConnectionString(YangOneConnectionStrings connectionString);
        bool SaveYOConfig(YangOneAppConfig config);
    }
}