import { useTranslation } from "react-i18next";
import { Controller } from "react-hook-form";
import GridFilter from "../../../components/dataGrid/gridFilter";
import { FilterProps } from "../../../types";

interface IFilter {
  name: string;
  status: string[];
}

const FilterThemeManagement = ({
  control,
  handleSubmit,
  onFilterSubmit,
  handleFilterReset,
  handleFilterRemove,
  handleFilterSearch,
  filterList,
  setFilter,
}: FilterProps<IFilter>) => {
  const { t } = useTranslation();

  const statusOptions = [
    { value: "draft", label: t("ThemeManagement.Status.draft") },
    { value: "published", label: t("ThemeManagement.Status.published") },
    { value: "under_review", label: t("ThemeManagement.Status.under_review") },
    { value: "approved", label: t("ThemeManagement.Status.approved") },
    { value: "archived", label: t("ThemeManagement.Status.archived") },
  ];

  return (
    <GridFilter
      onApplyClicked={() => {
        handleSubmit(onFilterSubmit)();
      }}
      onResetClicked={handleFilterReset}
      onSearchClicked={handleFilterSearch}
      filterList={filterList}
      removeFilter={handleFilterRemove}
    >
      <form className="flex flex-col gap-3">
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              placeholder={t("ThemeManagement.FilterName")}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              onChange={(e) => {
                field.onChange(e.target.value);
                setFilter &&
                  setFilter((prev) => [
                    ...prev.filter((f) => f.key !== "Name"),
                    { key: "Name", value: e.target.value },
                  ]);
              }}
            />
          )}
        />

        <Controller
          name="status"
          control={control}
          defaultValue={[]}
          render={({ field }) => (
            <div>
              <span className="block text-sm font-medium text-black dark:text-white mb-2">{t("ThemeManagement.FilterStatus")}</span>
              <div className="flex flex-wrap gap-4">
                {statusOptions.map((s) => (
                  <label className="flex items-center gap-2 cursor-pointer" key={s.value}>
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary dark:border-form-strokedark dark:bg-form-input"
                      value={s.value}
                      checked={Array.isArray(field.value) && field.value.includes(s.value)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const value = s.value;
                        let newValue = Array.isArray(field.value) ? [...field.value] : [];

                        if (checked) {
                          if (!newValue.includes(value)) newValue.push(value);
                        } else {
                          newValue = newValue.filter((v: any) => v !== value);
                        }

                        field.onChange(newValue);
                        setFilter &&
                          setFilter((prev) => {
                            const nonStatusFilters = prev.filter((f) => f.key !== "status");
                            const newStatusFilters = newValue.map((v) => ({
                              key: "status",
                              value: statusOptions.find((x) => x.value === v)?.label || v,
                            }));
                            return [...nonStatusFilters, ...newStatusFilters];
                          });
                      }}
                    />
                    <span className="text-sm dark:text-gray-300">{s.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        />
      </form>
    </GridFilter>
  );
};

export default FilterThemeManagement;