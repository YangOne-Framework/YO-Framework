import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import DataGrid from "../../../components/dataGrid/dataGrid";
import { Controller } from "react-hook-form";
import GridFilter from "../../../components/dataGrid/gridFilter";
import { useFilter } from "../../../hooks/useFilter";
import { useEffect, useState } from "react";
import { FilterProps } from "../../../types";
import ComponentCard from "../../../components/common/ComponentCard";
import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import toaster from "../../../components/toster";
import { useDeleteIdentityResourceMutation, useGetIdentityResourcesQuery } from "../../../redux/setting/clientAPI";

interface IFilter {
    Name: any;
}

const FilterIdentityResource = ({
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
                            placeholder={t('IdentityResource.Filter', 'Name')}
                            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            onChange={(e: any) => {
                                field.onChange(e.target.value);
                                setFilter &&
                                    setFilter((prev) => [
                                        ...prev.filter((f: any) => f.key !== "Name"),
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

export default function IdentityResourceList() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [limit, setLimit] = useState(10);
    const [identityResources, setIdentityResources] = useState([]);
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

    const searchQuery = searchText || (filterData as any)?.Name || "";

    const { data, isLoading, refetch } = useGetIdentityResourcesQuery({ offset: offset, limit: limit, search: searchQuery });
    const [deleteIdentityResource] = useDeleteIdentityResourceMutation();

    const columns = [
        {
            key: "name",
            label: t('IdentityResource.Name', 'Name'),
            render: (item: any) => (
                <Link
                    to={`/admin/openiddict/identityresource/edit?id=${item.id}`}
                    className="flex items-center gap-2 group-hover:text-primary pr-2"
                >
                    <span className="break-words font-medium">{item.name || t('Common.NA', 'N/A')}</span>
                </Link>
            ),
        },
        {
            key: "displayName",
            label: t('IdentityResource.DisplayName', 'Display Name'),
            render: (item: any) => item.displayName || t('Common.NA', 'N/A'),
        },
        {
            key: "description",
            label: t('IdentityResource.Description', 'Description'),
            render: (item: any) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.description || t('IdentityResource.NoDescription', 'No description')}
                </span>
            ),
        },
        {
            key: "actions",
            label: t('IdentityResource.Action', 'Action'),
            render: (row: any) => (
                <div className="flex items-center gap-2">
                    <button
                        title={t('Common.Edit', 'Edit')}
                        onClick={() => {
                            navigate(`/admin/openiddict/identityresource/edit?id=${row.id}`);
                        }}
                            className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-base cursor-pointer hover:bg-gray-100 dark:hover:bg-boxdark transition-colors"
                    >
                        <MdOutlineEdit size={20} />
                    </button>
                    <button
                        title={t('Common.Delete', 'Delete')}
                        onClick={() => {
                            if (confirm(t('IdentityResource.DeleteConfirm', 'Are you sure you want to delete this identity resource?'))) {
                                handleDelete(row.id);
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

    const handleDelete = async (id: string) => {
        try {
            const response = await deleteIdentityResource(id).unwrap();
            toaster.success(t('IdentityResource.DeleteSuccess', 'Identity Resource deleted successfully!'));
            refetch();
        } catch (error) {
            console.error(error);
            toaster.error(t('IdentityResource.DeleteError', 'An error occurred while deleting the identity resource.'));
        }
    };

    useEffect(() => {
        if (data) {
            setIdentityResources(data.Rows as any);
            setRowTotal(data.RowTotal);
        }
    }, [data]);

    return (
        <div className="space-y-6">
            <ComponentCard title={t('IdentityResource.Title', 'Identity Resource Management')}>
                <>
                    <div className="flex flex-col gap-5 px-6 mb-4 sm:flex-row sm:items-center sm:justify-between">
                        <FilterIdentityResource
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
                                    navigate("/admin/openiddict/identityresource/new");
                                }}
                                className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                            >
                                {t('IdentityResource.AddNew', 'Add New')}
                            </button>
                        </div>
                    </div>
                    <DataGrid
                        columns={columns}
                        isLoading={isLoading}
                        data={identityResources || []}
                         text={t("DataGrid.TotalRecords", { count: rowTotal })}
                        currentPage={offset}
                        totalPage={Math.ceil(rowTotal / limit) || 1}
                        isLine={true}
                        onPageChange={handlePagination}
                        isShadow
                    />
                </>
            </ComponentCard>
        </div>
    );
}
