import GridFilter from "../../../components/dataGrid/gridFilter";
import { FilterProps } from "../../../types";

const FilterModule = ({
  control,
  handleSubmit,
  onFilterSubmit,
  handleFilterReset,
  handleFilterRemove,
  handleFilterSearch,
  filterList,
  setFilter,
}: FilterProps<any>) => {
  return (
    <GridFilter
      placeholder="Search modules..."
      onApplyClicked={() => {
        handleSubmit(onFilterSubmit)();
      }}
      onResetClicked={handleFilterReset}
      onSearchClicked={handleFilterSearch}
      filterList={filterList}
      removeFilter={handleFilterRemove}
    />
  );
};

export default FilterModule;
