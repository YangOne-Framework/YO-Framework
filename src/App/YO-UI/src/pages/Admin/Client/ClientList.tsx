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
import { useDeleteApplicationMutation, useGetApplicationsQuery } from "../../../redux/setting/clientAPI";

interface IFilter {
    Name: any;
}

const FilterApplication = ({
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
                            placeholder={t('ClientList.Filter', 'Name / Client ID')}
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

export default function ClientList() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [limit, setLimit] = useState(10);
    const [applications, setApplications] = useState([]);
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

    // NOTE: clientAPI's useGetApplicationsQuery takes { offset, limit, search }
    // The useFilter hook provides 'searchText' for general search, and 'filterData' for structured filters.
    // For simplicity, we'll map general search text or the specific 'Name' filter to the API's 'search' param.
    const searchQuery = searchText || (filterData as any)?.Name || "";

    const { data, isLoading, refetch } = useGetApplicationsQuery({ offset: offset, limit: limit, search: searchQuery });
    const [deleteApplication] = useDeleteApplicationMutation();

    const columns = [
        {
            key: "ClientId",
            label: t('ClientList.ClientId', 'Client ID'),
            render: (item: any) => item.ClientId || t('Common.NA', 'N/A'),
        },
        {
            key: "DisplayName",
            label: t('ClientList.DisplayName', 'Display Name'),
            render: (item: any) => (
                <Link
                    to={`/admin/client/edit/${item.ClientId}`}
                    className="flex items-center gap-2 group-hover:text-primary pr-2"
                >
                    <span className="break-words">{item.DisplayName || t('Common.NA', 'N/A')}</span>
                </Link>
            ),
        },
        {
            key: "ClientType",
            label: t('ClientList.Type', 'Client Type'),
            render: (item: any) => item.ClientType || t('Common.NA', 'N/A'),
        },
        {
            key: "ConsentType",
            label: t('ClientForm.ConsentType', 'Consent Type'),
            render: (item: any) => item.ConsentType || t('Common.NA', 'N/A'),
        },
        {
            key: "actions",
            label: t('ClientList.Actions', 'Action'),
            render: (row: any) => (
                <div className="flex items-center gap-2">
                    <button
                        title={t('Common.Edit', 'Edit')}
                        onClick={() => {
                            navigate(`/admin/client/edit/${row.Id}`);
                        }}
                            className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-base cursor-pointer hover:bg-gray-100 dark:hover:bg-boxdark transition-colors"
                    >
                        <MdOutlineEdit size={20} />
                    </button>
                    <button
                        title={t('Common.Delete', 'Delete')}
                        onClick={() => {
                            if (confirm(t('ClientList.DeleteConfirm', 'Are you sure you want to delete this application?'))) {
                                handleDelete(row.Id);
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
            const response = await deleteApplication(id).unwrap();
            if (response.Code === 200) {
                toaster.success(t('ClientList.DeleteSuccess', 'Application deleted successfully!'));
                refetch();
            } else {
                toaster.error(response.Message || t('ClientList.DeleteFailed', 'Failed to delete application!'));
            }
        } catch (error) {
            console.error(error);
            toaster.error(t('ClientList.DeleteError', 'An error occurred while deleting the application.'));
        }
    };

    useEffect(() => {
        if (data) {
            setApplications(data.Data?.Rows as any);
            setRowTotal(data.Data?.RowTotal);
        }
    }, [data]);

    return (
        <div className="space-y-6">
            <ComponentCard title={t('ClientList.Title', 'Client Management')}>
                <>
                    <div className="flex flex-col gap-5 px-6 mb-4 sm:flex-row sm:items-center sm:justify-between">
                        <FilterApplication
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
                                    navigate("/admin/client/new");
                                }}
                                className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                            >
                                {t('ClientList.AddNew', 'Add New')}
                            </button>
                        </div>
                    </div>
                    <DataGrid
                        columns={columns}
                        isLoading={isLoading}
                        data={applications || []}
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
