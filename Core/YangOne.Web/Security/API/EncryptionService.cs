using System.Security.Cryptography;
using System.Text;

namespace YangOne.Web.Security;

public class EncryptionService
{
    private readonly byte[] _key;
    private readonly byte[] _iv;

    public EncryptionService(string key, string iv)
    {
        //  _key = Encoding.UTF8.GetBytes(key.PadRight(32, '0').Substring(0, 32)); // Ensure 256-bit key
        // _iv = Encoding.UTF8.GetBytes(iv.PadRight(16, '0').Substring(0, 16)); // Ensure 128-bit IV
        // Take first 32 chars for 256-bit key, first 16 chars for 128-bit IV
        _key = Encoding.UTF8.GetBytes(key.Substring(0, 32));
        _iv = Encoding.UTF8.GetBytes(iv.Substring(0, 16));
    }

    public string Encrypt(string plainText)
    {
        using (Aes aesAlg = Aes.Create())
        {
            aesAlg.Key = _key;
            aesAlg.IV = _iv;

            ICryptoTransform encryptor = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV);

            using (MemoryStream msEncrypt = new MemoryStream())
            {
                using (CryptoStream csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                {
                    using (StreamWriter swEncrypt = new StreamWriter(csEncrypt))
                    {
                        swEncrypt.Write(plainText);
                    }
                    return Convert.ToBase64String(msEncrypt.ToArray());
                }
            }
        }
    }
}