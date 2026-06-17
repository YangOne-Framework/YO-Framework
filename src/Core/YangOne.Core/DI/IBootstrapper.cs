// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.DI
{
    internal interface IBootstrapper
    {
        void Init();
        bool Build();
    }
}
