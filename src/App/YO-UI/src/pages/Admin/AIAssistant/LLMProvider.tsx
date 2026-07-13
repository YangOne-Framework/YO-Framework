
import { Link, useNavigate } from "react-router";
import DataGrid from "../../../components/dataGrid/dataGrid";
import { Controller } from "react-hook-form";
import GridFilter from "../../../components/dataGrid/gridFilter";
import { useFilter } from "../../../hooks/useFilter";
import { useEffect, useState } from "react";
import { FilterProps } from "../../../types";
import ComponentCard from "../../../components/common/ComponentCard";
import { useGetProvidersQuery, useDeleteProviderMutation } from "../../../redux/aibot/llmProviderAPI";
import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import toaster from "../../../components/toster";
import { useTranslation } from "react-i18next";

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
          name="JobPosition"
          control={control}
          render={({ field }) => (
            <input {...field} type="text"
              onChange={(e: any) => {
                field.onChange(e.target.value);

                setFilter && setFilter((prev) => [
                  ...prev.filter((f) => f.key !== "JobPosition"),
                  {
                    key: "JobPosition",
                    value: e.target.value,
                  },
                ]);
              }} />
          )}
        />

      </form>
    </GridFilter>
  );
};

export default function LLMProvider() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [limit, setLimit] = useState(10);
  const [providers, setProviders] = useState([]);
  const [rowTotal, setRowTotal] = useState(0);

  const {
    control: control2,
    handleSubmit: handleSubmit2,
    onFilterSubmit,
    handleFilterReset,
    handleFilterRemove,
    handleFilterSearch,
    handlePagination,
    filterList,
    setFilter,
    query,
    offset,
  } = useFilter<IFilter>({
    defaultValues: {
      JobPosition: '',
    },
    limit,
    enableFilterList: true,
  });

  const { data, isLoading, refetch } = useGetProvidersQuery(`?${query}`);
  const [deleteProvider, { isLoading: deleting }] = useDeleteProviderMutation();

  const columns = [
    {
      key: "LLMProviderId",
      label: t("LLMProvider.No"),
      render: (item: any) => {
        return (item?.LLMProviderId ? item?.LLMProviderId : "N/A");
      }
    },
    {
      key: "Name",
      label: t("LLMProvider.Name"),
      render: (item: any) => (
        <Link
          to={`/admin/llmprovider/detail/${item?.LLMProviderId}`}
          className="flex items-center gap-2 group-hover:text-primary pr-2"
        >
          <span className=" break-words">{item.Name}</span>
        </Link>
      ),
    },
    {
      key: "IsActive",
      label: t("LLMProvider.IsActive"),
      render: (item: any) => {
        return (item?.IsActive ? t("Common.Yes") : t("Common.No"));
      }
    },
    {
      key: "actions",
      label: t("LLMProvider.Action"),
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <button
            title={t("LLMProvider.Edit")}
            onClick={() => {
              const newParams = new URLSearchParams();
              newParams.set("id", row.LLMProviderId.toString());
              window.location.href = `/admin/llmprovider/edit?${newParams.toString()}`;
            }}
            className="border p-2 rounded-md border-gray-300 text-base cursor-pointer"
          >
            <MdOutlineEdit size={20} />
          </button>
          <button
            title={t("LLMProvider.Delete")}
            onClick={() => {
              if (confirm(t("LLMProvider.DeleteConfirm"))) {
                handleDelete(row.LLMProviderId);
              }
            }}
            className="border p-2 rounded-md border-gray-300 text-red-500 cursor-pointer"
          >
            <MdDeleteOutline size={20} />
          </button>
        </div>
      ),
    },
  ];
  const handleDelete = async (id: number) => {
    try {
      var response: any = await deleteProvider({ LLMProviderId: id }).unwrap();
      if (response.Code == 200) {
        toaster.success(t("LLMProvider.DeletedSuccess"))
        refetch();
      } else {
        toaster.error(t("LLMProvider.DeleteFailed"))
      }
    } catch (error) {
    }
  };
  useEffect(() => {
    if (data != undefined && data.Code == 200) {
      setProviders(data.Data);
      if (data.Data.length > 0) {
        setRowTotal(data.Data[0]?.RowTotal || 0);
      }
    }
  }, [data]);
  return (
    <>
      <div className="space-y-6">
        <ComponentCard title={t("LLMProvider.Title")}>
          <>
            <div className="flex flex-col gap-5 px-6 mb-4 sm:flex-row sm:items-center sm:justify-between">
              <FilterLearnerManagement
                control={control2}
                handleSubmit={handleSubmit2}
                onFilterSubmit={onFilterSubmit}
                handleFilterRemove={handleFilterRemove}
                handleFilterReset={handleFilterReset}
                handleFilterSearch={handleFilterSearch}
                filterList={filterList}
                setFilter={setFilter}
              />
              <div className="relative" >
                <button type="button"
                  onClick={() => {
                    navigate("/admin/llmprovider/new")
                  }}
                  className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                >{t("LLMProvider.AddNew")}</button>
              </div>
            </div>
            <DataGrid
              columns={columns}
              isLoading={isLoading}
              data={providers || []}
              text={t("LLMProvider.TotalLabel", { count: rowTotal })}
              currentPage={offset}
              totalPage={rowTotal}
              isLine={true}
              onPageChange={handlePagination}
              isShadow
            />
          </>
        </ComponentCard>
      </div>
    </>
  );
}
