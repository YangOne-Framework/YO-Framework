// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web
{
    public interface IWidgetService
    {
        Task<bool> Load();
        Task<IWidget> Find(string name);
        Task<IEnumerable<IWidget>> GetByConfigSource(string configSourcePath);
        Task<IEnumerable<IWidget>> GetAllWidgets();


    }
}
