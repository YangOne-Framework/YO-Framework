// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Collections.Generic;

namespace YangOne.Configuration
{
    /// <summary>
    /// Base class for configuration change events with listener attachment and notification.
    /// </summary>
    public abstract class ConfigChangeEvent
    {
        readonly List<IConfigChangeListener> _changeListeners = new List<IConfigChangeListener>();

        protected ConfigChangeEvent()
        {
        }

        public void Attach(IConfigChangeListener listener)
        {
            _changeListeners.Add(listener);
        }

        public void Detach(IConfigChangeListener listener)
        {
            _changeListeners.Remove(listener);
        }

        public void Notify()
        {
            foreach (IConfigChangeListener listener in _changeListeners)
            {
                listener.Update();
            }
        }

      
    }
    /// <summary>
    /// Concrete configuration change event for the YO framework.
    /// </summary>
    public class YangOneConfigChangeEvent : ConfigChangeEvent
    {

    }
}
