namespace YangOne.Storage;

public class YangOneFile: IFile
{
    public string ContentType { get; set; }
    public Stream Stream { get; set; }
}