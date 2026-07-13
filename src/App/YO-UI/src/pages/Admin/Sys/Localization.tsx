import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ComponentCard from '../../../components/common/ComponentCard';
import DataGrid from "../../../components/dataGrid/dataGrid";
import { Controller } from "react-hook-form";
import GridFilter from "../../../components/dataGrid/gridFilter";
import { useFilter } from "../../../hooks/useFilter";
import { FilterProps } from "../../../types";
import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import {
    useGetRegionsQuery,
    useDeleteRegionMutation,
    useImportLocalizationMutation,
    useLazyExportLocalizationQuery
} from '../../../redux/setting/localizationAPI';
import toaster from '../../../components/toster';
import { LocaleRegion } from '../../../types/settingTypes';
import { useTranslation } from "react-i18next";

interface IFilter {
    Name: any;
}

const FilterLocalization = ({
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
                            placeholder={t("Localization.FilterName")}
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

const Localization = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [limit, setLimit] = useState(10);
    const [regions, setRegions] = useState<LocaleRegion[]>([]);
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
    } = useFilter<IFilter>({
        defaultValues: {
            Name: "",
        },
        limit,
        enableFilterList: true,
    });

    const { data: regionsData, isLoading, refetch } = useGetRegionsQuery({
        pageNo: offset,
        rowsPerPage: limit,
        query: searchText
    });

    const [deleteRegion] = useDeleteRegionMutation();
    const [importLocalization, { isLoading: isImporting }] = useImportLocalizationMutation();
    const [triggerExport] = useLazyExportLocalizationQuery();

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const cdnPath = import.meta.env.VITE_CDN_PATH || "";

    const handleDelete = async (id: number) => {
        if (confirm(t("Common.Yes"))) {
            try {
                const res = await deleteRegion(id).unwrap();
                if (res.Code === 200) {
                    toaster.success(t("Localization.Deleted"));
                    refetch();
                } else {
                    toaster.error(res.Message);
                }
            } catch (err: any) {
                toaster.error(err?.data?.Message || t("Localization.DeleteFailed"));
            }
        }
    };

    const handleExport = async (id: number) => {
        try {
            const blob = await triggerExport({ localRegionId: id }).unwrap();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Localization_${id}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            toaster.success(t("Localization.Export"));
        } catch (err) {
            toaster.error(t("Localization.Export"));
        }
    };

    const handleImportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!importFile) {
            toaster.error(t("Localization.Import"));
            return;
        }

        try {
            const res = await importLocalization({ ImportFile: importFile }).unwrap();
            if (res.Code === 200) {
                toaster.success(t("Localization.Import"));
                setIsImportModalOpen(false);
                setImportFile(null);
                refetch();
            } else {
                toaster.error(res.Message || t("Localization.Import"));
            }
        } catch (err: any) {
            toaster.error(err?.data?.Message || t("Localization.Import"));
        }
    };

    useEffect(() => {
        if (regionsData != undefined && regionsData.Code == 200) {
            setRegions(regionsData.Data);
            if (regionsData.Data.length > 0) {
                setRowTotal(regionsData.RowTotal || (regionsData.Data[0] as any)?.RowTotal || 0);
            } else {
                setRowTotal(0);
            }
        }
    }, [regionsData]);

    const columns = [
        {
            key: "country",
            label: t("Localization.Name"),
            render: (item: LocaleRegion) => (
                <div className="flex items-center gap-3">
                    {item.Flag && (
                        <img src={`${cdnPath}/country/flags/${item.Flag}`} alt={t("Localization.Name")} className="h-5 w-8 object-cover rounded shadow-sm" />
                    )}
                    <span className="hidden text-black dark:text-white sm:block">{item.CountryName}</span>
                </div>
            ),
        },
        {
            key: "culture",
            label: t("Localization.Code"),
            render: (item: LocaleRegion) => <span className="text-black dark:text-white">{item.Culture}</span>,
        },
        {
            key: "isDefault",
            label: t("Localization.Language"),
            render: (item: LocaleRegion) => (
                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${item.IsDefault ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                    {item.IsDefault ? t("Common.Yes") : t("Common.No")}
                </span>
            ),
        },
        {
            key: "isActive",
            label: t("Localization.Status"),
            render: (item: LocaleRegion) => (
                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${item.IsActive ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                    {item.IsActive ? t("Common.Yes") : t("Common.No")}
                </span>
            ),
        },
        {
            key: "actions",
            label: t("Localization.Actions"),
            render: (row: LocaleRegion) => (
                <div className="flex items-center gap-2">
                    <button
                        title={t("Localization.Export")}
                        onClick={() => handleExport(row.LocaleRegionId)}
                        className="hover:text-primary"
                    >
                        {t("Localization.Export")}
                    </button>
<button
                                title={t("Form.Edit")}
                                onClick={() => navigate(`/admin/localization/edit/${row.LocaleRegionId}`)}
                                className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-base cursor-pointer hover:bg-gray-100 dark:hover:bg-boxdark"
                            >
                        <MdOutlineEdit size={20} />
                    </button>
<button
                                title={t("Form.Delete")}
                                onClick={() => handleDelete(row.LocaleRegionId)}
                                className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-base cursor-pointer hover:text-danger hover:bg-gray-100 dark:hover:bg-boxdark"
                            >
                        <MdDeleteOutline size={20} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <ComponentCard title={t("Localization.Title")}>
                <>
                    <div className="flex flex-col gap-5 px-6 mb-4 sm:flex-row sm:items-center sm:justify-between">
                        <FilterLocalization
                            control={control}
                            handleSubmit={handleSubmit}
                            onFilterSubmit={onFilterSubmit}
                            handleFilterRemove={handleFilterRemove}
                            handleFilterReset={handleFilterReset}
                            handleFilterSearch={handleFilterSearch}
                            filterList={filterList}
                            setFilter={setFilter}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsImportModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-warning shadow-theme-xs hover:bg-opacity-90"
                            >
                                {t("Localization.Import")}
                            </button>
                            <button
                                onClick={() => navigate("/admin/localization/new")}
                                className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                            >
                                {t("Localization.AddNewRegion")}
                            </button>
                        </div>
                    </div>

                    <DataGrid
                        columns={columns}
                        isLoading={isLoading}
                        data={regions || []}
                         text={t("DataGrid.TotalRecords", { count: rowTotal })}
                        currentPage={offset}
                        totalPage={Math.ceil(rowTotal / limit) || 1}
                        isLine={true}
                        onPageChange={handlePagination}
                        isShadow
                    />
                </>
            </ComponentCard>

            {isImportModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-lg rounded-lg bg-white p-8 dark:bg-boxdark">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-black dark:text-white">{t("Localization.Import")}</h3>
                            <button onClick={() => setIsImportModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                X
                            </button>
                        </div>
                        <form onSubmit={handleImportSubmit}>
                            <div className="mb-5">
                                <label className="mb-2.5 block font-medium text-black dark:text-white">{t("Localization.Import")}</label>
                                <input
                                    type="file"
                                    accept=".xls,.xlsx"
                                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                                    className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent font-medium outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-3 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setIsImportModalOpen(false)} className="rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white">
                                    {t("Form.Cancel")}
                                </button>
                                <button type="submit" disabled={isImporting} className="rounded bg-primary py-2 px-6 font-medium text-white hover:bg-opacity-90">
                                    {isImporting ? t("Common.Loading") : t("Localization.Import")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Localization;
