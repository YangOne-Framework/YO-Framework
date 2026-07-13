import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import DataGrid from "../components/dataGrid/dataGrid";
import { Controller } from "react-hook-form";
import GridFilter from "../components/dataGrid/gridFilter";
import { useFilter } from "../hooks/useFilter";
import { useState } from "react";
import { FilterProps } from "../types";
import ComponentCard from "../components/common/ComponentCard";

interface IFilter {
  JobPosition: any;
}

const FilterLearnerManagement = ({
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
        <Controller
          name="JobPosition"
          control={control}
          render={({ field }) => (
            <input {...field} type="text" 
              onChange={(e:any) => {
                field.onChange(e.target.value);
               
                setFilter&&setFilter((prev) => [
                  ...prev.filter((f) => f.key !== "JobPosition"),
                  {
                    key: "JobPosition",
                    value:e.target.value,
                  },
                ]);
              }}  />
          )}
        />

      </form>
    </GridFilter>
  );
};

export default function SampleTable() {
  //const [offset, setOffset] = useState(1);
  

  return (
    <>
      <div className="space-y-6">
      
      </div>

    </>
  );
}
