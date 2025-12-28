using System.IO;

namespace YangOne.Storage
{
    public interface IFile
    {
        string ContentType { get; set; }
        Stream Stream { get; set; }
    }
}