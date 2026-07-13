import React, { useState, useEffect } from "react";
import {
    useGetAllModerationLogsQuery,
    useGetModerationDetailQuery,
    useGetModerationStatsQuery,
} from "../../../redux/aibot/moderationAPI";
import DataGrid from "../../../components/dataGrid/dataGrid";
import { FilterProps } from "../../../types";
import { Controller, useForm } from "react-hook-form";
import GridFilter from "../../../components/dataGrid/gridFilter";
import { useFilter } from "../../../hooks/useFilter";
import ComponentCard from "../../../components/common/ComponentCard";
import { Modal } from "../../../components/ui/modal";
import { useTranslation } from "react-i18next";

interface IModerationLog {
    AiAssistantModerationLogId: number;
    AiAssistantId: number;
    UserId: number;
    IsBlocked: boolean;
    Flagged: boolean;
    Timestamp: string;
    Query: string;
    Response: string;
}

interface IModerationStats {
    TotalQueries: number;
    FlaggedQueries: number;
    BlockedQueries: number;
}

interface IFilter {
    AiAssistantId: number;
    UserId: number;
    IsBlocked: boolean | null;
    FlaggedOnly: boolean | null;
    StartDate?: Date | null;
    EndDate?: Date | null;
    Query: string;
}

const FilterModeration = ({
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
                    name="AiAssistantId"
                    control={control}
                    render={({ field }) => (
                        <input
                            {...field}
                            type="number"
                            placeholder={t("Moderation.AssistantId")}
                            className="dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700"
                            onChange={(e: any) => {
                                field.onChange(Number(e.target.value));
                                setFilter &&
                                    setFilter((prev: any) => [
                                        ...prev.filter((f) => f.key !== "AiAssistantId"),
                                        {
                                            key: "AiAssistantId",
                                            value: Number(e.target.value),
                                        },
                                    ]);
                            }}
                        />
                    )}
                />
                <Controller
                    name="UserId"
                    control={control}
                    render={({ field }) => (
                        <input
                            {...field}
                            type="number"
                            placeholder={t("Moderation.UserId")}
                            onChange={(e: any) => {
                                field.onChange(Number(e.target.value));
                                setFilter &&
                                    setFilter((prev: any) => [
                                        ...prev.filter((f) => f.key !== "UserId"),
                                        {
                                            key: "UserId",
                                            value: Number(e.target.value),
                                        },
                                    ]);
                            }}
                        />
                    )}
                />
                <Controller
                    name="StartDate"
                    control={control}
                    render={({ field }) => (
                        <input
                            {...field}
                            type="date"
                            placeholder={t("Moderation.StartDate")}
                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                            onChange={(e: any) => {
                                field.onChange(e.target.value);
                                setFilter &&
                                    setFilter((prev: any) => [
                                        ...prev.filter((f) => f.key !== "StartDate"),
                                        {
                                            key: "StartDate",
                                            value: e.target.value,
                                        },
                                    ]);
                            }}
                        />
                    )}
                />
                <Controller
                    name="EndDate"
                    control={control}
                    render={({ field }) => (
                        <input
                            {...field}
                            type="date"
                            placeholder={t("Moderation.EndDate")}
                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                            onChange={(e: any) => {
                                field.onChange(e.target.value);
                                setFilter &&
                                    setFilter((prev: any) => [
                                        ...prev.filter((f) => f.key !== "EndDate"),
                                        {
                                            key: "EndDate",
                                            value: e.target.value,
                                        },
                                    ]);
                            }}
                        />
                    )}
                />
                <Controller
                    name="IsBlocked"
                    control={control}
                    render={({ field }) => (
                        <select
                            {...field}
                            onChange={(e: any) => {
                                const value = e.target.value === "" ? null : e.target.value === "true";
                                field.onChange(value);
                                setFilter &&
                                    setFilter((prev: any) => [
                                        ...prev.filter((f) => f.key !== "IsBlocked"),
                                        {
                                            key: "IsBlocked",
                                            value: value,
                                        }]
                                    );
                            }}
                            value={field.value === null ? "" : field.value.toString()}
                            className="dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700"
                        >
                            <option value="">{t("Moderation.All")}</option>
                            <option value="true">{t("Moderation.Blocked")}</option>
                            <option value="false">{t("Moderation.NotBlocked")}</option>
                        </select>
                    )}
                />
                <Controller
                    name="FlaggedOnly"
                    control={control}
                    render={({ field }) => (
                        <select
                            {...field}
                            onChange={(e: any) => {
                                const value = e.target.value === "" ? null : e.target.value === "true";
                                field.onChange(value);
                                setFilter &&
                                    setFilter((prev: any) => [
                                        ...prev.filter((f) => f.key !== "FlaggedOnly"),
                                        {
                                            key: "FlaggedOnly",
                                            value: value,
                                        }]
                                    );
                            }}
                            value={field.value === null ? "" : field.value.toString()}
                            className="dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700"
                        >
                            <option value="">{t("Moderation.All")}</option>
                            <option value="true">{t("Moderation.FlaggedOnly")}</option>
                            <option value="false">{t("Moderation.NotFlagged")}</option>
                        </select>
                    )}
                />
                <Controller
                    name="Query"
                    control={control}
                    render={({ field }) => (
                        <input
                            {...field}
                            type="text"
                            placeholder={t("Moderation.Query")}
                            onChange={(e: any) => {
                                field.onChange(e.target.value);
                                setFilter &&
                                    setFilter((prev: any) => [
                                        ...prev.filter((f) => f.key !== "Query"),
                                        {
                                            key: "Query",
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

const Moderation = () => {
    const { t } = useTranslation();
    const [limit, setLimit] = useState(10);
    const [ModerationLogs, setModerationLogs] = useState<IModerationLog[]>([]);
    const [SelectedLog, setSelectedLog] = useState<IModerationLog | null>(null);
    const [IsDetailModalOpen, setIsDetailModalOpen] = useState(false);
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
            AiAssistantId: 0,
            UserId: 0,
            IsBlocked: null,
            FlaggedOnly: null,
            StartDate: null,
            EndDate: null,
            Query: "",
        },
        limit,
        enableFilterList: true,
    });

    const { data, isLoading, refetch } = useGetAllModerationLogsQuery(
        `?${query}`
    );
    const { data: StatsData, isLoading: IsStatsLoading } =
        useGetModerationStatsQuery({
            aiAssistantId: 0,
            startDate: new Date(),
            endDate: new Date(),
        });
    const { data: ModerationDetail, isLoading: IsModerationDetailLoading } =
        useGetModerationDetailQuery(
            {
                aiAssistantModerationLogId: SelectedLog?.AiAssistantModerationLogId,
            },
            { skip: !SelectedLog?.AiAssistantModerationLogId }
        );
    useEffect(() => {
        if (ModerationDetail?.Code === 200) {
            setSelectedLog(ModerationDetail.Data);
        }
    }, [ModerationDetail]);
    const Columns = [
        {
            key: "AiAssistantModerationLogId",
            label: t("Moderation.NoColumn"),
            render: (item: IModerationLog) =>
                item?.AiAssistantModerationLogId
                    ? item?.AiAssistantModerationLogId
                    : "N/A",
        },
        {
            key: "AiAssistantId",
            label: t("Moderation.AIAssistantId"),
            render: (item: IModerationLog) =>
                item?.AiAssistantId ? item?.AiAssistantId : "N/A",
        },
        {
            key: "UserId",
            label: t("Moderation.UserIdColumn"),
            render: (item: IModerationLog) => (item?.UserId ? item?.UserId : "N/A"),
        },
        {
            key: "Timestamp",
            label: t("Moderation.Timestamp"),
            render: (item: IModerationLog) =>
                item?.Timestamp ? item?.Timestamp : "N/A",
        },
        {
            key: "actions",
            label: t("Moderation.Action"),
            render: (Row: IModerationLog) => (
                <button
                    onClick={() => {
                        setSelectedLog(Row);
                        setIsDetailModalOpen(true);
                    }}
                    className="border p-2 rounded-md border-gray-300 dark:border-gray-600 text-base cursor-pointer"
                >
                    {t("Moderation.ViewDetail")}
                </button>
            ),
        },
    ];

    useEffect(() => {
        if (data && data.Data) {
            setModerationLogs(data.Data);
            setRowTotal(data.RowTotal || 0);
        }
    }, [data]);

    return (
        <>
            <ComponentCard title={t("Moderation.Title")}>
                <div className="flex flex-col gap-5 px-6 mb-4 sm:flex-row sm:items-center sm:justify-between">
                    <FilterModeration
                        control={control}
                        handleSubmit={handleSubmit}
                        onFilterSubmit={onFilterSubmit}
                        handleFilterRemove={handleFilterRemove}
                        handleFilterReset={handleFilterReset}
                        handleFilterSearch={handleFilterSearch}
                        filterList={filterList}
                        setFilter={setFilter}
                    />
                </div>
                {IsStatsLoading ? (
                    <div>{t("Moderation.LoadingStats")}</div>
                ) : StatsData ? (
                    <div className="flex gap-4">
                        <div>{t("Moderation.TotalQueries")} {StatsData.Data.TotalQueries}</div>
                        <div>{t("Moderation.FlaggedQueries")} {StatsData.Data.FlaggedQueries}</div>
                        <div>{t("Moderation.BlockedQueries")} {StatsData.Data.BlockedQueries}</div>
                    </div>
                ) : (
                    <div>{t("Moderation.ErrorStats")}</div>
                )}
                <DataGrid
                    columns={Columns}
                    isLoading={isLoading}
                    data={ModerationLogs || []}
                    text={t("Moderation.TotalLabel", { count: RowTotal })}
                    currentPage={offset}
                    totalPage={RowTotal}
                    isLine={true}
                    onPageChange={handlePagination}
                    isShadow
                />
            </ComponentCard>

            {/* Detail Modal */}
            <Modal
                isOpen={IsDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                showCloseButton={true}
            >
                {SelectedLog && (
                    <ComponentCard title={t("Moderation.DetailTitle")}>
                        <p>{t("Moderation.AIAssistantIdLabel")} {SelectedLog.AiAssistantId}</p>
                        <p>{t("Moderation.UserIdLabel")} {SelectedLog.UserId}</p>
                        <p>{t("Moderation.TimestampLabel")} {SelectedLog.Timestamp}</p>
                        <p>{t("Moderation.QueryLabel")} {SelectedLog.Query}</p>
                        <p>{t("Moderation.ResponseLabel")} {SelectedLog.Response}</p>
                        <p>{t("Moderation.IsBlockedLabel")} {SelectedLog.IsBlocked ? t("Moderation.Yes") : t("Common.No")}</p>
                        <p>{t("Moderation.FlaggedLabel")} {SelectedLog.Flagged ? t("Moderation.Yes") : t("Common.No")}</p>
                    </ComponentCard>
                )}
            </Modal>
        </>
    );
};

export default Moderation;
