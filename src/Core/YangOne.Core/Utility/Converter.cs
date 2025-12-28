using Microsoft.AspNetCore.Mvc.Rendering;
namespace YangOne.Utility
{
    public static class Converter
    {
        public static IEnumerable<SelectListItem> EnumSelectListConverter<T>()
        {
            return (Enum.GetValues(typeof(T)).Cast<int>().Select(
                enu => new SelectListItem() { Text = Enum.GetName(typeof(T), enu), Value = enu.ToString() })).ToList();
        }
    }
}
