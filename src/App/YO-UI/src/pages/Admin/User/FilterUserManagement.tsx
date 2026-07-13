import { useTranslation } from "react-i18next";
import { Controller } from "react-hook-form";
import GridFilter from "../../../components/dataGrid/gridFilter";
import { FilterProps } from "../../../types";

interface IFilter {
  email: string;
  roleId: string[];
}

const FilterUserManagement = ({
  control,
  handleSubmit,
  onFilterSubmit,
  handleFilterReset,
  handleFilterRemove,
  handleFilterSearch,
  filterList,
  setFilter,
  roles,
}: FilterProps<IFilter> & { roles: any[]; }) => {
  const { t } = useTranslation();
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
          name="email"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              placeholder={t('UserManagement.FilterEmail')}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              onChange={(e) => {
                field.onChange(e.target.value);
                setFilter &&
                  setFilter((prev) => [
                    ...prev.filter((f) => f.key !== "Email"),
                    { key: "Email", value: e.target.value },
                  ]);
              }}
            />
          )}
        />

        <Controller
          name="roleId"
          control={control}
          defaultValue={[]}
          render={({ field }) => (
            <div>
              <span className="block text-sm font-medium text-black dark:text-white mb-2">{t('UserManagement.FilterRole')}</span>
              <div className="flex flex-wrap gap-4">
                {roles.length > 0 &&
                  roles.map((s: any) => (
                    <label className="flex items-center gap-2 cursor-pointer" key={s.Id}>
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary dark:border-form-strokedark dark:bg-form-input"
                        value={s.Id}
                        checked={Array.isArray(field.value) && field.value.includes(String(s.Id))}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const value = String(s.Id);
                          let newValue = Array.isArray(field.value) ? [...field.value] : [];

                          if (checked) {
                            if (!newValue.includes(value)) newValue.push(value);
                          } else {
                            newValue = newValue.filter((v: any) => v !== value);
                          }

                          field.onChange(newValue);
                          setFilter &&
                            setFilter((prev) => {
                              const otherFilters = prev.filter((f) => f.key !== "roleId" || (f.key === "roleId" && !roles.some(r => r.Name === f.value)));
                              // Logic to clear old role filters confusing. 
                              // Simplified approach: Clear all roleId entries and re-add current selection
                              const nonRoleFilters = prev.filter(f => f.key !== 'roleId');
                              const newRoleFilters = newValue.map((v) => ({
                                key: "roleId",
                                value: roles.find((x: any) => String(x.Id) === v)?.Name || v,
                              }));
                              return [...nonRoleFilters, ...newRoleFilters];
                            });
                        }}
                      />
                      <span className="text-sm dark:text-gray-300">{s.Name}</span>
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

export default FilterUserManagement;