using System.Collections;
using Microsoft.Extensions.FileProviders;

namespace YangOne.Plugin
{
    public class PluginDirectoryContents : IDirectoryContents, IEnumerable<IFileInfo>, IEnumerable
    {
        private readonly IEnumerable<IFileInfo> _entries;

        public bool Exists
        {
            get
            {
                return true;
            }
        }

        public PluginDirectoryContents(IEnumerable<IFileInfo> entries)
        {
            if (entries == null)
                throw new ArgumentNullException("entries");
            this._entries = entries;
        }

        public IEnumerator<IFileInfo> GetEnumerator()
        {
            return this._entries.GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return (IEnumerator)this._entries.GetEnumerator();
        }
    }
}