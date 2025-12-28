namespace YangOne.Web.Security
{
    public interface ITokenGenerator
    {
        Task<object> Generate() ;
        string RequestAntiforgeryToken();
    }
}