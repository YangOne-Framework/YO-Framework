import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import DataGrid from "../../../components/dataGrid/dataGrid";
import { Controller } from "react-hook-form";
import GridFilter from "../../../components/dataGrid/gridFilter";
import { useFilter } from "../../../hooks/useFilter";
import { useEffect, useState } from "react";
import { FilterProps } from "../../../types";
import ComponentCard from "../../../components/common/ComponentCard";
import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import toaster from "../../../components/toster";
import { useDeleteHtmlComponentMutation, useGetAllHtmlComponentsQuery } from "../../../redux/htmlbuilder/htmlBuilderAPI";

interface IFilter {
    Name: any;
}

const FilterHtmlComponent = ({
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
                            placeholder={t('HtmlComponent.Filter', 'Name')}
                            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
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

export default function ComponentBuilderList() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [limit, setLimit] = useState(10);
    const [htmlComponents, setHtmlComponents] = useState([]);
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
        offset,
        searchText,
        filterData,
    } = useFilter<IFilter>({
        defaultValues: {
            Name: "",
        },
        limit,
        enableFilterList: true,
    });

    const { data, isLoading, refetch } = useGetAllHtmlComponentsQuery({ query: searchText, limit, offset, ...filterData });
    const [deleteHtmlComponent] = useDeleteHtmlComponentMutation();

    const columns = [
        {
            key: "htmlComponentId",
            label: t('HtmlComponent.No', '#No'),
            render: (item: any) => {
                return item?.HtmlComponentId ? item?.HtmlComponentId : t('Common.NA', 'N/A');
            },
        },
        {
            key: "name",
            label: t('HtmlComponent.Name', 'Name'),
            render: (item: any) => (
                <Link
                    to={`/admin/componentbuilder/edit?id=${item?.HtmlComponentId}`}
                    className="flex items-center gap-2 group-hover:text-primary pr-2"
                >
                    <span className=" break-words">{item.Name}</span>
                </Link>
            ),
        },
        {
            key: "displayName",
            label: t('HtmlComponent.DisplayName', 'Display Name'),
            render: (item: any) => (
                <>
                    {item.DisplayName || t('Common.NA', 'N/A')}
                </>
            ),
        },
        {
            key: "shortDescription",
            label: t('HtmlComponent.Description', 'Description'),
            render: (item: any) => (
                <>
                    {item.ShortDescription || t('Common.NA', 'N/A')}
                </>
            ),
        },
        {
            key: "isActive",
            label: t('HtmlComponent.IsActive', 'Is Active'),
             render: (item: any) => (
                                         <span
                                             className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                                                 item?.IsActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                             }`}
                                         >
                                             {item?.IsActive ? t('Common.Yes', 'Yes') : t('Common.No', 'No')}
                                         </span>
                                     ),
        },
        {
            key: "actions",
            label: t('HtmlComponent.Action', 'Action'),
            render: (row: any) => (
                <div className="flex items-center gap-2">
                                        <button
                                            title={t('Common.Edit', 'Edit')}
                                            onClick={() => {
                                                navigate(`/admin/componentbuilder/edit?id=${row.HtmlComponentId}`);
                                            }}
                                            className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-base cursor-pointer hover:bg-gray-100 dark:hover:bg-boxdark hover:text-primary transition-colors"
                                        >
                        <MdOutlineEdit size={20} />
                    </button>
                                        <button
                                            title={t('Common.Delete', 'Delete')}
                                            onClick={() => {
                                                if (confirm(t('HtmlComponent.DeleteConfirm', 'Are you sure?'))) {
                                                    handleDelete(row.HtmlComponentId);
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
            var response: any = await deleteHtmlComponent(id).unwrap();
            if (response.Code == 200) {
                toaster.success(t('HtmlComponent.DeleteSuccess', 'Component deleted successfully!'));
                refetch();
            } else {
                toaster.error(t('HtmlComponent.DeleteFailed', 'Failed to delete component!'));
            }
        } catch (error) {
            toaster.error(t('HtmlComponent.DeleteError', 'An error occurred while deleting the component.'));
        }
    };

    useEffect(() => {
        if (data != undefined && data.Code == 200) {
            setHtmlComponents(data.Data);
            if (data.Data.length > 0) {
                setRowTotal(data.Data[0]?.RowTotal || 0);
            }
        }
    }, [data]);

    return (
        <>
            <div className="space-y-6">
                <ComponentCard title={t('HtmlComponent.Title')}>
                    <>
                        <div className="flex flex-col gap-5 px-6 mb-4 sm:flex-row sm:items-center sm:justify-between">
                            <FilterHtmlComponent
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
                                        navigate("/admin/componentbuilder/new");
                                    }}
                                    className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                                >
                                    {t('HtmlComponent.AddNew', 'Add New')}
                                </button>
                            </div>
                        </div>
                        <DataGrid
                            columns={columns}
                            isLoading={isLoading}
                            data={htmlComponents || []}
                             text={t("DataGrid.TotalRecords", { count: rowTotal })}
                            currentPage={offset}
                            totalPage={(rowTotal / limit) || 1}
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
