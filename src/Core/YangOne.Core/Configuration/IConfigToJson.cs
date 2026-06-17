// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Configuration
{
    public interface IConfigToJson
    {
        bool SaveConnectionString(YangOneConnectionStrings connectionString);
        bool SaveYOConfig(YangOneAppConfig config);
    }
}
