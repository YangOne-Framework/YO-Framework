using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Azure.BlobStorage.Helper
{
    public class YOBlobStorageProvider
    {
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _hostEnvironment;
        private string containerName = "yoblobcontainer";
        public YOBlobStorageProvider(IConfiguration configuration,IWebHostEnvironment hostEnvironment)
        {
            _configuration = configuration;
            _hostEnvironment = hostEnvironment;
        }
        //private void test()
        //{


        //    string connectionString = _configuration["Azure:StorageConnectionString"].ToString();


        //    // Get a reference to a container named "sample-container" and then create it
        //    BlobContainerClient container = new BlobContainerClient(connectionString, containerName);
        //    container.Create();

        //    // Get a reference to a blob named "sample-file" in a container named "sample-container"
        //    BlobClient blob = container.GetBlobClient(blobName);

        //    // Upload local file
        //    blob.Upload();
        //}

        public async Task<List<string>> GetAllBlobs()
        {


            string connectionString = _configuration["Azure:StorageConnectionString"].ToString();

            BlobContainerClient container = new BlobContainerClient(connectionString, containerName);
            await container.CreateIfNotExistsAsync();
            var items = new List<string>();
            foreach (BlobItem blob in container.GetBlobs())
            {
                items.Add(blob.Name);
            }

            return items;
        }
        public async Task<string> Save(IFormFile file)
        {
            string connectionString = _configuration["Azure:StorageConnectionString"].ToString();
            BlobContainerClient container = new BlobContainerClient(connectionString, containerName);
            await container.CreateIfNotExistsAsync();

            // Get a reference to a blob named "sample-file" in a container named "sample-container"
            BlobClient blob = container.GetBlobClient(Guid.NewGuid().ToString()+Path.GetExtension(file.FileName));
            // Create a URI to the blob
          

            // Create the blob client.
            //  BlobClient blobClient = new BlobClient("blobUri");
            var x = await blob.UploadAsync(file.OpenReadStream());
            var xx= blob.Uri.AbsoluteUri;
            return blob.Uri.AbsoluteUri.Replace(blob.Uri.Query, string.Empty);  

        }
        public async Task<string> Save(string relativeFilePath, string fileNamewithExtension)
        {
            string connectionString = _configuration["Azure:StorageConnectionString"].ToString();
            BlobContainerClient container = new BlobContainerClient(connectionString, containerName);
            await container.CreateIfNotExistsAsync();

            // Get a reference to a blob named "sample-file" in a container named "sample-container"
            BlobClient blob = container.GetBlobClient(fileNamewithExtension);
            string physicalPath = Path.Combine(_hostEnvironment.WebRootPath, relativeFilePath.TrimStart('/'));
            var x = await blob.UploadAsync(physicalPath);
            var xx = blob.Uri.AbsoluteUri;
            return blob.Uri.AbsoluteUri.Replace(blob.Uri.Query, string.Empty);

        }
        public async Task<string> Save(Stream stream,string fileNamewithExtension)
        {
            string connectionString = _configuration["Azure:StorageConnectionString"].ToString();
            BlobContainerClient container = new BlobContainerClient(connectionString, containerName);
            await container.CreateIfNotExistsAsync();

            // Get a reference to a blob named "sample-file" in a container named "sample-container"
            BlobClient blob = container.GetBlobClient(fileNamewithExtension);
            var x = await blob.UploadAsync(stream);
            var xx = blob.Uri.AbsoluteUri;
            return blob.Uri.AbsoluteUri.Replace(blob.Uri.Query, string.Empty);

        }
      
        public Task<string> SaveFile(string filePath, string contentType, Stream stream)
        {
            throw new NotImplementedException();
        }

        public Task<string> Save(string dirPath, IFormFile file)
        {
            throw new NotImplementedException();
        }
        public async Task<bool> Delete(string filePath)
        {
            string p = Path.GetFileName(filePath);
            var blob = await GetBlob(p);
            return await blob.DeleteIfExistsAsync();
        }

        public async Task<BlobClient> GetBlob(string fileWithExtension)
        {
            string connectionString = _configuration["Azure:StorageConnectionString"].ToString();

            BlobContainerClient container = new BlobContainerClient(connectionString, containerName);

            BlobClient blob = container.GetBlobClient(fileWithExtension);

            return blob;
        }
    }
}