import GridFilter from "../../../components/dataGrid/gridFilter";
import { FilterProps } from "../../../types";

interface ICmsPageFilter {
  title: string;
  status: string;
}

const CmsPageFilter = ({
  control,
  handleSubmit,
  onFilterSubmit,
  handleFilterReset,
  handleFilterRemove,
  handleFilterSearch,
  filterList,
  setFilter,
}: FilterProps<ICmsPageFilter>) => {
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

export default CmsPageFilter;
