// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Collections.Concurrent;

namespace YangOne.Web.Form
{
    /// <summary>
    /// Provides a thread-safe cache for form input data sources.
    /// </summary>
    public class FormDatasource
    {
        private ConcurrentDictionary<string,IEnumerable<FormInputItem>> _sources
        {
            get;
            set;
        }=new ConcurrentDictionary<string, IEnumerable<FormInputItem>>();
        public IEnumerable<FormInputItem> GetSource(string key)
        {
            if(_sources.ContainsKey(key))
                return _sources[key];
            else
            {
                return new List<FormInputItem>();
            }
        }

        public bool SetSource(string key, IEnumerable<FormInputItem> objects)
        {
            if (!_sources.ContainsKey(key))
            {
                _sources.GetOrAdd(key, objects);
                return true;
            }
            return false;
        }
        

    }
}
