using System;
using System.Collections.Generic;
using YangOne.BlogEngine.Model;

namespace YangOne.BlogEngine.Model
{
   

    public class PostViewDetailModel
    {
        public Post Post { get; set; }
        public PostSetting Setting { get; set; }
    }

    public class ArchiveViewModel
    {
        public IEnumerable<DateTime> Months { get; set; }
    }
}