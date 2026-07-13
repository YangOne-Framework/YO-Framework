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
import { useDeleteGrantMutation, useGetGrantsQuery, useRevokeGrantMutation } from "../../../redux/setting/clientAPI";

interface IFilter {
    Name: any;
}

const FilterGrant = ({
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
                            placeholder={t('GrantList.Filter', 'Subject / Application')}
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

export default function GrantList() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [limit, setLimit] = useState(10);
    const [grants, setGrants] = useState([]);
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

    const { data, isLoading, refetch } = useGetGrantsQuery({ offset: offset, limit: limit, search: searchQuery });
    const [deleteGrant] = useDeleteGrantMutation();
    const [revokeGrant] = useRevokeGrantMutation();

    const columns = [
        {
            key: "subject",
            label: t('GrantList.Subject', 'Subject'),
            render: (item: any) => item.subject || t('Common.NA', 'N/A'),
        },
        {
            key: "applicationName",
            label: t('GrantList.Application', 'Application'),
            render: (item: any) => item.applicationName || t('Common.NA', 'N/A'),
        },
        {
            key: "creationDate",
            label: t('GrantList.Created', 'Created'),
            render: (item: any) => item.creationDate ? new Date(item.creationDate).toLocaleDateString() : t('Common.NA', 'N/A'),
        },
        {
            key: "status",
            label: t('GrantList.Status', 'Status'),
            render: (item: any) => (
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.status === "valid" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}>
                    {item.status || t('Common.NA', 'N/A')}
                </span>
            ),
        },
        {
            key: "scopes",
            label: t('GrantList.Scopes', 'Scopes'),
            render: (item: any) => (
                <div className="flex flex-wrap gap-1">
                    {item.scopes?.slice(0, 3).map((scope: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded dark:bg-blue-900 dark:text-blue-200">
                            {scope}
                        </span>
                    ))}
                    {item.scopes?.length > 3 && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded dark:bg-gray-700 dark:text-gray-300">
                            +{item.scopes.length - 3}
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: "actions",
            label: t('GrantList.Action', 'Action'),
            render: (row: any) => (
                <div className="flex items-center gap-2">
                    <button
                        title={t('Common.Edit', 'Edit')}
                        onClick={() => {
                            navigate(`/admin/openiddict/grant/edit?id=${row.id}`);
                        }}
                            className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-base cursor-pointer hover:bg-gray-100 dark:hover:bg-boxdark transition-colors"
                    >
                        <MdOutlineEdit size={20} />
                    </button>
                    <button
                        title={t('GrantList.Revoke', 'Revoke')}
                        onClick={() => {
                            if (confirm(t('GrantList.RevokeConfirm', 'Are you sure you want to revoke this grant?'))) {
                                handleRevoke(row.id);
                            }
                        }}
                            className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-orange-500 cursor-pointer hover:bg-gray-100 dark:hover:bg-boxdark transition-colors"
                    >
                        <MdDeleteOutline size={20} />
                    </button>
                    <button
                        title={t('Common.Delete', 'Delete')}
                        onClick={() => {
                            if (confirm(t('GrantList.DeleteConfirm', 'Are you sure you want to delete this grant?'))) {
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

    const handleRevoke = async (id: string) => {
        try {
            const response = await revokeGrant(id).unwrap();
            toaster.success(t('GrantList.RevokeSuccess', 'Grant revoked successfully!'));
            refetch();
        } catch (error) {
            console.error(error);
            toaster.error(t('GrantList.RevokeError', 'An error occurred while revoking the grant.'));
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await deleteGrant(id).unwrap();
            toaster.success(t('GrantList.DeleteSuccess', 'Grant deleted successfully!'));
            refetch();
        } catch (error) {
            console.error(error);
            toaster.error(t('GrantList.DeleteError', 'An error occurred while deleting the grant.'));
        }
    };

    useEffect(() => {
        if (data) {
            setGrants(data.Rows as any);
            setRowTotal(data.RowTotal);
        }
    }, [data]);

    return (
        <div className="space-y-6">
            <ComponentCard title={t('GrantList.Title', 'Grant Management')}>
                <>
                    <div className="flex flex-col gap-5 px-6 mb-4 sm:flex-row sm:items-center sm:justify-between">
                        <FilterGrant
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
                                    navigate("/admin/openiddict/grant/new");
                                }}
                                className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                            >
                                {t('GrantList.AddNew', 'Add New')}
                            </button>
                        </div>
                    </div>
                    <DataGrid
                        columns={columns}
                        isLoading={isLoading}
                        data={grants || []}
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
