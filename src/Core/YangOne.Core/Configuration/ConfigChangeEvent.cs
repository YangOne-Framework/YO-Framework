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
        readonly List<IConfigChangeListner> _changeListners = new List<IConfigChangeListner>();

        // Constructor
        protected ConfigChangeEvent()
        {
           
        }

        public void Attach(IConfigChangeListner listner)
        {
            _changeListners.Add(listner);
        }

        public void Detach(IConfigChangeListner listner)
        {
            _changeListners.Remove(listner);
        }

        public void Notify()
        {
            foreach (IConfigChangeListner investor in _changeListners)
            {
                investor.Update();
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
