import { Link, useNavigate } from "react-router-dom";
import DataGrid from "../../../components/dataGrid/dataGrid";
import { Controller } from "react-hook-form";
import GridFilter from "../../../components/dataGrid/gridFilter";
import { useFilter } from "../../../hooks/useFilter";
import { useEffect, useState } from "react";
import { FilterProps } from "../../../types";
import ComponentCard from "../../../components/common/ComponentCard";
import {
    useGetAllThemesQuery,
    useDeleteThemeMutation,
} from "../../../redux/aibot/themeAPI";
import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import toaster from "../../../components/toster";
import { useTranslation } from "react-i18next";

interface IFilter {
    Name: string;
}

const FilterTheme = ({
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
                            placeholder={t("Theme.Filter")}
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

export default function Theme() {
    const { t } = useTranslation();
    const Navigate = useNavigate();
    const [limit, setLimit] = useState(10);
    const [Themes, setThemes] = useState([]);
    const [RowTotal, setRowTotal] = useState(0);

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

    const { data, isLoading, refetch } = useGetAllThemesQuery(`?${query}`);
    const [DeleteTheme, { isLoading: IsDeleting }] = useDeleteThemeMutation();

    const Columns = [
        {
            key: "AIAssistantThemeId",
            label: t("Theme.No"),
            render: (item: any) => (item?.AIAssistantThemeId ? item?.AIAssistantThemeId : "N/A"),
        },
        {
            key: "Name",
            label: t("Theme.Name"),
            render: (item: any) => (
                <Link
                    to={`/admin/assistant/theme/edit?id=${item?.AIAssistantThemeId}`}
                    className="flex items-center gap-2 group-hover:text-primary pr-2"
                >
                    <span className=" break-words">{item.Name}</span>
                </Link>
            ),
        },
        {
            key: "actions",
            label: t("Theme.Action"),
            render: (Row: any) => (
                <div className="flex items-center gap-2">
                                <button
                                    title={t("Theme.Edit")}
                                    onClick={() => {
                                        const NewParams = new URLSearchParams();
                                        NewParams.set("id", Row.AIAssistantThemeId.toString());
                                        Navigate(`/admin/assistant/theme/edit?${NewParams.toString()}`);
                                    }}
                                    className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-base cursor-pointer hover:bg-gray-100 dark:hover:bg-boxdark transition-colors"
                                >
                                    <MdOutlineEdit size={20} />
                                </button>
                                <button
                                    title={t("Theme.Delete")}
                                    onClick={() => {
                                        if (confirm(t("Theme.DeleteConfirm"))) {
                                            handleDelete(Row.AIAssistantThemeId);
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

    const handleDelete = async (Id: number) => {
        try {
            const Response: any = await DeleteTheme({ AIAssistantThemeId: Id }).unwrap();
            if (Response.Code === 200) {
                toaster.success(t("Theme.DeletedSuccess"));
                refetch();
            } else {
                toaster.error(t("Theme.DeleteFailed"));
            }
        } catch (error) {
            console.error(error);
            toaster.error(t("Theme.DeleteError"));
        }
    };

    useEffect(() => {
        if (data && data.Code === 200) {
            setThemes(data.Data);
            setRowTotal(data.RowTotal || 0);
        }
    }, [data]);

    return (
        <>
            <div className="space-y-6">
                <ComponentCard title={t("Theme.Title")}>
                    <>
                        <div className="flex flex-col gap-5 px-6 mb-4 sm:flex-row sm:items-center sm:justify-between">
                            <FilterTheme
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
                                        Navigate("/admin/assistant/theme/new");
                                    }}
                                    className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                                >
                                    {t("Theme.AddNew")}
                                </button>
                            </div>
                        </div>
                        <DataGrid
                            columns={Columns}
                            isLoading={isLoading}
                            data={Themes || []}
                            text={t("Theme.TotalLabel", { count: RowTotal })}
                            currentPage={offset}
                            totalPage={RowTotal}
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
