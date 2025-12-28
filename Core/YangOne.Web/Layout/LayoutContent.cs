namespace YangOne.Web.Layout
{
    public class LayoutContent
    {    public int PageId { get; set; }
        public string Name { get; set; } = "";
        public List<LayoutContentResource> Resources { get; set; }=new List<LayoutContentResource>();
        public List<Row> Rows { get; set; }=new List<Row>();
    }
}