import { useForm, SubmitHandler, DefaultValues } from "react-hook-form";
import { useState, useEffect } from "react";
import { IFilterList } from "../types";
 const createFilterList = <T extends Record<string, any>>(
  data: T,
  dateList: string[]
): IFilterList[] => {
  const list: IFilterList[] = [];

  for (const key in data) {
    if (
      Object.prototype.hasOwnProperty.call(data, key) &&
      data[key] !== "" &&
      data[key] !== null &&
      data[key] !== undefined
    ) {
      list.push({
        key,
        value: String(data[key]),
        type: dateList.includes(key) ? "date" : "text",
      });
    }
  }

  return list;
};

interface UseFilterOptions<T> {
  defaultValues: DefaultValues<T>;
  limit: number;
  dateFields?: string[];
  enableFilterList?: boolean;
}

export function useFilter<T extends Record<string, any>>({
  defaultValues,
  limit,
  dateFields = [],
  enableFilterList = true,
}: UseFilterOptions<T>) {
  const { register, control, handleSubmit, reset } = useForm<T>();
  const [filterData, setFilterData] = useState<T | null>(null);
  const [searchText, setSearchText] = useState("");
  const [filterList, setFilterList] = useState<IFilterList[]>([]);
  const [filter, setFilter] = useState<IFilterList[]>([]);
  const [offset, setPageNo] = useState(1);
  const [query, setQuery] = useState(
    `offset=${offset}&rowsPerPage=${limit}`
  );

  const handleFilter = (
    offset: number,
    searchText: string,
    filterData: T | null
  ) => {
    let q = `offset=${offset}&limit=${limit}&query=${encodeURIComponent(
      searchText
    )}`;
    if (filterData) {
      for (const key in filterData) {
        const value = filterData[key];
        q += `&${key}=${encodeURIComponent(value ?? "")}`;
      }
    }
    setQuery(q);
  };

  const onFilterSubmit: SubmitHandler<T> = (data) => {
    setFilterData(data);
    handleFilter(offset, searchText, data);

    if (enableFilterList) {
      setFilterList(filter);
    } else {
      setFilterList(createFilterList(data, dateFields));
    }
  };

  const handleFilterReset = () => {
    setFilter([]);
    setFilterData(null);
    setFilterList([]);
    handleFilter(offset, searchText, null);
    reset(defaultValues);
  };

  const handleFilterRemove = (key: string) => {
    if (!filterData) return;
    const updatedFilter = { ...filterData, [key]: undefined };
    reset(updatedFilter);
    setFilterData(updatedFilter);
    handleFilter(offset, searchText, updatedFilter);
    setFilterList(filterList.filter((item) => item.key !== key));
    if (enableFilterList) {
      setFilter(filter.filter((item) => item.key !== key));
    }
  };

  const handleFilterSearch = (s: string) => {
    setSearchText(s);
    handleFilter(offset, s, filterData);
  };

  const handlePagination = (page: number) => {
    setPageNo(page);
    handleFilter(page, searchText, filterData);
  };

  return {
    register,
    control,
    handleSubmit,
    onFilterSubmit,
    handleFilterReset,
    handleFilterRemove,
    handleFilterSearch,
    handlePagination,
    filterData,
    setFilterData,
    searchText,
    filterList,
    query,
    offset,
    ...(enableFilterList && { setFilter }),
  };
}
