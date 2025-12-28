using Azure.Storage;
using WholisticMinds.Storage;
using WholisticMinds.Web;

namespace Azure.BlobStorage.Helper
{
    //st=2022-03-27T12:05:25Z&se=2022-03-27T20:05:25Z&si=wmblobid&sv=2020-08-04&sr=c&sig=HFkBgkNf%2BvfcCqajWllGPlmgxiF%2FGJCH1MSkhfzGWi0%3D
    //https://wholisticminds01.blob.core.windows.net/wmblob?st=2022-03-27T12:05:25Z&se=2022-03-27T20:05:25Z&si=wmblobid&sv=2020-08-04&sr=c&sig=HFkBgkNf%2BvfcCqajWllGPlmgxiF%2FGJCH1MSkhfzGWi0%3D
    public class Class1
    {
        //connection string
        //BlobEndpoint=https://wholisticminds01.blob.core.windows.net/;QueueEndpoint=https://wholisticminds01.queue.core.windows.net/;FileEndpoint=https://wholisticminds01.file.core.windows.net/;TableEndpoint=https://wholisticminds01.table.core.windows.net/;SharedAccessSignature=sv=2020-08-04&ss=bfqt&srt=sco&sp=rwdlacupix&se=2023-03-27T20:07:09Z&st=2022-03-27T12:07:09Z&spr=https,http&sig=Z313OMB1YRUQurLoakgLmmTGaZTB35yu7oawQqviWNM%3D

        //token
        //?sv=2020-08-04&ss=bfqt&srt=sco&sp=rwdlacupix&se=2023-03-27T20:07:09Z&st=2022-03-27T12:07:09Z&spr=https,http&sig=Z313OMB1YRUQurLoakgLmmTGaZTB35yu7oawQqviWNM%3D

        //Blob service SAS URL
        //https://wholisticminds01.blob.core.windows.net/?sv=2020-08-04&ss=bfqt&srt=sco&sp=rwdlacupix&se=2023-03-27T20:07:09Z&st=2022-03-27T12:07:09Z&spr=https,http&sig=Z313OMB1YRUQurLoakgLmmTGaZTB35yu7oawQqviWNM%3D

        //File service SAS URL
        //https://wholisticminds01.file.core.windows.net/?sv=2020-08-04&ss=bfqt&srt=sco&sp=rwdlacupix&se=2023-03-27T20:07:09Z&st=2022-03-27T12:07:09Z&spr=https,http&sig=Z313OMB1YRUQurLoakgLmmTGaZTB35yu7oawQqviWNM%3D


        //Queue service SAS URL
        //https://wholisticminds01.queue.core.windows.net/?sv=2020-08-04&ss=bfqt&srt=sco&sp=rwdlacupix&se=2023-03-27T20:07:09Z&st=2022-03-27T12:07:09Z&spr=https,http&sig=Z313OMB1YRUQurLoakgLmmTGaZTB35yu7oawQqviWNM%3D

        //Table service SAS URL
        //https://wholisticminds01.table.core.windows.net/?sv=2020-08-04&ss=bfqt&srt=sco&sp=rwdlacupix&se=2023-03-27T20:07:09Z&st=2022-03-27T12:07:09Z&spr=https,http&sig=Z313OMB1YRUQurLoakgLmmTGaZTB35yu7oawQqviWNM%3D
    }
}
