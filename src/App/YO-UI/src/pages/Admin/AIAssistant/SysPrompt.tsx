import { Link, useNavigate } from "react-router";
import DataGrid from "../../../components/dataGrid/dataGrid";
import { Controller } from "react-hook-form";
import GridFilter from "../../../components/dataGrid/gridFilter";
import { useFilter } from "../../../hooks/useFilter";
import { useEffect, useState } from "react";
import { FilterProps } from "../../../types";
import ComponentCard from "../../../components/common/ComponentCard";
import {
  useGetAllSystemPromptsQuery,
  useDeleteSystemPromptMutation,
} from "../../../redux/aibot/systemPromptAPI";
import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import toaster from "../../../components/toster";
import { useTranslation } from "react-i18next";

interface IFilter {
  Name: string;
}

const FilterSystemPrompt = ({
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
          name="Name"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              placeholder={t("SysPrompt.Filter")}
              onChange={(e: any) => {
                field.onChange(e.target.value);
                setFilter &&
                  setFilter((prev) => [
                    ...prev.filter((f) => f.key !== "Name"),
                    {
                      key: "Name",
                      value: e.target.value,
                    },
                  ]);
              }}
            />
          )}
        />
      </form>
    </GridFilter>
  );
};

export default function SysPrompt() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [limit, setLimit] = useState(10);
  const [systemPrompts, setSystemPrompts] = useState([]);
  const [rowTotal, setRowTotal] = useState(0);

  const {
    control,
    handleSubmit,
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
      Name: "",
    },
    limit,
    enableFilterList: true,
  });

  const { data, isLoading, refetch } = useGetAllSystemPromptsQuery(`?${query}`);
  const [deleteSystemPrompt, { isLoading: isDeleting }] = useDeleteSystemPromptMutation();

  const columns = [
    {
      key: "SystemPromptId",
      label: t("SysPrompt.No"),
      render: (item: any) => (item?.SystemPromptId ? item?.SystemPromptId : "N/A"),
    },
    {
      key: "name",
      label: t("SysPrompt.Name"),
      render: (item: any) => (
        <Link
          to={`/admin/systemprompt/edit?id=${item?.SystemPromptId}`}
          className="flex items-center gap-2 group-hover:text-primary pr-2"
        >
          <span className=" break-words">{item.Name}</span>
        </Link>
      ),
    },
    {
      key: "Code",
      label: t("SysPrompt.Code"),
      render: (item: any) => (item?.Code ? item?.Code : "N/A"),
    },
    {
      key: "IsActive",
      label: t("SysPrompt.IsActive"),
      render: (item: any) => (item?.IsActive ? t("Common.Yes") : t("Common.No")),
    },
    {
      key: "actions",
      label: t("SysPrompt.Action"),
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <button
            title={t("SysPrompt.Edit")}
            onClick={() => {
              const newParams = new URLSearchParams();
              newParams.set("id", row.SystemPromptId?.toString() || "");
              navigate(`/admin/systemprompt/edit?${newParams.toString()}`);
            }}
            className="border p-2 rounded-md border-gray-300 text-base cursor-pointer"
          >
            <MdOutlineEdit size={20} />
          </button>
          <button
            title={t("SysPrompt.Delete")}
            onClick={() => {
              if (confirm(t("SysPrompt.DeleteConfirm"))) {
                handleDelete(row.SystemPromptId);
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
      const response: any = await deleteSystemPrompt({ SystemPromptId: id }).unwrap();
      if (response === true) {
        toaster.success(t("SysPrompt.DeletedSuccess"));
        refetch();
      } else {
        toaster.error(t("SysPrompt.DeleteFailed"));
      }
    } catch (error) {
      toaster.error(t("SysPrompt.DeleteError"));
    }
  };

  useEffect(() => {
    if (data && data.Code === 200) {
      setSystemPrompts(data.Data);
      setRowTotal(data.Data[0]?.RowTotal || 0);
    }
  }, [data]);

  return (
    <>
      <div className="space-y-6">
        <ComponentCard title={t("SysPrompt.Title")}>
          <>
            <div className="flex flex-col gap-5 px-6 mb-4 sm:flex-row sm:items-center sm:justify-between">
              <FilterSystemPrompt
                control={control}
                handleSubmit={handleSubmit}
                onFilterSubmit={onFilterSubmit}
                handleFilterRemove={handleFilterRemove}
                handleFilterReset={handleFilterReset}
                handleFilterSearch={handleFilterSearch}
                filterList={filterList}
                setFilter={setFilter}
              />
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    navigate("/admin/systemprompt/new");
                  }}
                  className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                >
                  {t("SysPrompt.AddNew")}
                </button>
              </div>
            </div>
            <DataGrid
              columns={columns}
              isLoading={isLoading}
              data={systemPrompts || []}
              text={t("SysPrompt.TotalLabel", { count: rowTotal })}
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
