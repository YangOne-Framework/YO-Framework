
import GridFilter from "../../../components/dataGrid/gridFilter";
import { FilterProps } from "../../../types";

interface IFilter {
  roleName: string;
}

const FilterRoleManagement = ({
  control,
  handleSubmit,
  onFilterSubmit,
  handleFilterReset,
  handleFilterRemove,
  handleFilterSearch,
  filterList,
  setFilter,
}: FilterProps<IFilter>) => {
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
        {/* Add specific filters here if needed, e.g. status */}
      </form>
    </GridFilter>
  );
};

export default FilterRoleManagement;