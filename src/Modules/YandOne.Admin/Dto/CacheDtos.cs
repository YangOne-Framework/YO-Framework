// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Admin.Dto;

public class CacheKeyDto
{
    public CacheKeyDto() { }
    public CacheKeyDto(string key) => Key = key;
    public string Key { get; set; }
}

public class CacheInfoDto
{
    public CacheInfoDto() { }
    public CacheInfoDto(int keyCount, List<string> keys, string providerName, string providerType)
    {
        KeyCount = keyCount;
        Keys = keys;
        ProviderName = providerName;
        ProviderType = providerType;
    }
    public int KeyCount { get; set; }
    public List<string> Keys { get; set; }
    public string ProviderName { get; set; }
    public string ProviderType { get; set; }
}

public class CacheProviderDto
{
    public CacheProviderDto() { }
    public CacheProviderDto(string name, string value, bool isCurrent)
    {
        Name = name;
        Value = value;
        IsCurrent = isCurrent;
    }
    public string Name { get; set; }
    public string Value { get; set; }
    public bool IsCurrent { get; set; }
}

public class CacheProvidersDto
{
    public CacheProvidersDto() { }
    public CacheProvidersDto(List<CacheProviderDto> providers, string currentProvider, string configuredProvider, bool requiresRestart)
    {
        Providers = providers;
        CurrentProvider = currentProvider;
        ConfiguredProvider = configuredProvider;
        RequiresRestart = requiresRestart;
    }
    public List<CacheProviderDto> Providers { get; set; }
    public string CurrentProvider { get; set; }
    public string ConfiguredProvider { get; set; }
    public bool RequiresRestart { get; set; }
}

public class SwitchProviderResultDto
{
    public SwitchProviderResultDto() { }
    public SwitchProviderResultDto(string provider, bool restartRequired)
    {
        Provider = provider;
        RestartRequired = restartRequired;
    }
    public string Provider { get; set; }
    public bool RestartRequired { get; set; }
}
