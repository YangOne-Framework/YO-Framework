// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
//namespace YangOne.Security;

//public class CspConfigProvider
//{
//    private readonly string _filePath;
//    private CspConfig _config;
//    private readonly object _lock = new object();

//    public CspConfigProvider(string filePath)
//    {
//        _filePath = filePath;
//        LoadConfig();

//        var watcher = new FileSystemWatcher(Path.GetDirectoryName(_filePath) ?? ".", Path.GetFileName(_filePath));
//        watcher.NotifyFilter = NotifyFilters.LastWrite | NotifyFilters.Size | NotifyFilters.Attributes;
//        watcher.Changed += (s, e) => ReloadConfig();
//        watcher.EnableRaisingEvents = true;
//    }

//    private void LoadConfig()
//    {
//        lock (_lock)
//        {
//            _config = CspConfigLoader.Load(_filePath);
//        }
//    }

//    private void ReloadConfig()
//    {
//        // Small delay for file system quirks
//        Thread.Sleep(100);
//        LoadConfig();
//    }

//    public CspConfig GetConfig()
//    {
//        lock (_lock)
//        {
//            return _config;
//        }
//    }
//}
