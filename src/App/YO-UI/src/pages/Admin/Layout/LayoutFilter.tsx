import GridFilter from "../../../components/dataGrid/gridFilter";
import { FilterProps } from "../../../types";

interface ILayoutFilter {
  name: string;
}

const LayoutFilter = ({
  control,
  handleSubmit,
  onFilterSubmit,
  handleFilterReset,
  handleFilterRemove,
  handleFilterSearch,
  filterList,
  setFilter,
}: FilterProps<ILayoutFilter>) => {
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
      <form className="flex flex-col gap-3" />
    </GridFilter>
  );
};

export default LayoutFilter;
