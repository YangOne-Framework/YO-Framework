// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Storage
{
    public interface IKeyGenerator
    {
        string GetKey();
        string GetKey(int size);
    }
}
