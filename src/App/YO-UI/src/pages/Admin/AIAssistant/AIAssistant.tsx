import { Link, useNavigate } from "react-router";
import DataGrid from "../../../components/dataGrid/dataGrid";
import { Controller } from "react-hook-form";
import GridFilter from "../../../components/dataGrid/gridFilter";
import { useFilter } from "../../../hooks/useFilter";
import { useEffect, useState } from "react";
import { FilterProps } from "../../../types";
import ComponentCard from "../../../components/common/ComponentCard";
import {
  useGetAssistantsQuery,
  useDeleteAssistantMutation,
} from "../../../redux/aibot/aiAssistantAPI";
import { MdChat, MdDeleteOutline, MdOutlineEdit, MdSettings } from "react-icons/md";
import toaster from "../../../components/toster";
import { useTranslation } from "react-i18next";

interface IFilter {
  Name: any;
}

const FilterAssistant = ({
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
          name="Name"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
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

export default function AIAssistant() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [limit, setLimit] = useState(10);
  const [assistants, setAssistants] = useState([]);
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

  const { data, isLoading, refetch } = useGetAssistantsQuery(`?${query}`);
  const [deleteAssistant, { isLoading: deleting }] = useDeleteAssistantMutation();

  const columns = [
    {
      key: "AIAssistantId",
      label: t("AIAssistant.No"),
      render: (item: any) => {
        return item?.AIAssistantId ? item?.AIAssistantId : "N/A";
      },
    },
    {
      key: "Name",
      label: t("AIAssistant.Name"),
      render: (item: any) => (
        <Link
          to={`/admin/aiassistant/detail/${item?.AIAssistantId}`}
          className="flex items-center gap-2 group-hover:text-primary pr-2"
        >
          <span className=" break-words">{item.Name}</span>
        </Link>
      ),
    },
    {
      key: "Description",
      label: t("AIAssistant.Description"),
      render: (item: any) => (
        <>
          {item.Description || "N/A"}
        </>
      ),
    },
    {
      key: "IsActive",
      label: t("AIAssistant.IsActive"),
      render: (item: any) => {
        return item?.IsActive ? t("Common.Yes") : t("Common.No");
      },
    },
    {
      key: "actions",
      label: t("AIAssistant.Action"),
      render: (row: any) => (
        <div className="flex items-center gap-2">
            <button
              title={t("AIAssistant.ConfigurePrompt")}
              onClick={() => {
                const newParams = new URLSearchParams();
                newParams.set("id", row.AIAssistantId.toString());
                window.location.href = `/admin/aiassistant/prompt?${newParams.toString()}`;
              }}
              className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-base cursor-pointer hover:bg-gray-100 dark:hover:bg-boxdark transition-colors"
            >
              <MdChat size={20} />
            </button>
            <button
              title={t("AIAssistant.ConfigureAssistant")}
              onClick={() => {
                const newParams = new URLSearchParams();
                newParams.set("id", row.AIAssistantId.toString());
                window.location.href = `/admin/aiassistant/setting?${newParams.toString()}`;
              }}
              className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-base cursor-pointer hover:bg-gray-100 dark:hover:bg-boxdark transition-colors"
            >
              <MdSettings size={20} />
            </button>
            <button
              title={t("AIAssistant.Edit")}
              onClick={() => {
                const newParams = new URLSearchParams();
                newParams.set("id", row.AIAssistantId.toString());
                window.location.href = `/admin/aiassistant/edit?${newParams.toString()}`;
              }}
              className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-base cursor-pointer hover:bg-gray-100 dark:hover:bg-boxdark transition-colors"
            >
              <MdOutlineEdit size={20} />
            </button>
            <button
              title={t("AIAssistant.Delete")}
              onClick={() => {
                if (confirm(t("AIAssistant.DeleteConfirm"))) {
                  handleDelete(row.AIAssistantId);
                }
              }}
              className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-red-500 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <MdDeleteOutline size={20} />
            </button>
        </div>
      ),
    },
  ];

  const handleDelete = async (id: number) => {
    try {
      var response: any = await deleteAssistant({ AIAssistantId: id }).unwrap();
      if (response.Code == 200) {
        toaster.success(t("AIAssistant.DeletedSuccess"));
        refetch();
      } else {
        toaster.error(t("AIAssistant.DeleteFailed"));
      }
    } catch (error) {
      toaster.error(t("AIAssistant.DeleteError"));
    }
  };

  useEffect(() => {
    if (data != undefined && data.Code == 200) {
      setAssistants(data.Data);
      if (data.Data.length > 0) {
        setRowTotal(data.Data[0]?.RowTotal || 0);
      }
    }
  }, [data]);

  return (
    <>
      <div className="space-y-6">
        <ComponentCard title={t("AIAssistant.Title")}>
          <>
            <div className="flex flex-col gap-5 px-6 mb-4 sm:flex-row sm:items-center sm:justify-between">
              <FilterAssistant
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
                    navigate("/admin/aiassistant/new");
                  }}
                  className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                >
                  {t("AIAssistant.AddNew")}
                </button>
              </div>
            </div>
            <DataGrid
              columns={columns}
              isLoading={isLoading}
              data={assistants || []}
              text={t("AIAssistant.TotalLabel", { count: rowTotal })}
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
