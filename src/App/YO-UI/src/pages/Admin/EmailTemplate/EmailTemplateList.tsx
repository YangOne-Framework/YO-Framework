import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { MdOutlineEdit, MdDeleteOutline, MdVisibility, MdCode, MdEmail } from "react-icons/md";
import DataGrid from "../../../components/dataGrid/dataGrid";
import ComponentCard from "../../../components/common/ComponentCard";
import FilterEmailTemplate from "./FilterEmailTemplate";
import EmailTemplatePreview from "./EmailTemplatePreview";
import toaster from "../../../components/toster";
import {
  useGetEmailTemplatesQuery,
  useDeleteEmailTemplateMutation,
} from "../../../redux/email/emailTemplateAPI";
import { useFilter } from "../../../hooks/useFilter";
import { useTranslation } from "react-i18next";

interface IFilter {
  name: string;
}

const EmailTemplateList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [rowTotal, setRowTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [preview, setPreview] = useState<{ name: string; subject: string; html: string } | null>(null);

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
    defaultValues: { name: "" },
    limit,
    enableFilterList: true,
  });

  const { data, isLoading, refetch } = useGetEmailTemplatesQuery({
    query: searchText,
    limit,
    offset,
    ...filterData,
  });

  const [deleteTemplate] = useDeleteEmailTemplateMutation();

  const handleDelete = async (id: number, templateType: string) => {
    if (templateType?.toLowerCase() === "sys") {
      toaster.error(t("EmailTemplate.Actions"));
      return;
    }
    try {
      await deleteTemplate(id).unwrap();
      toaster.success(t("EmailTemplate.Actions"));
      refetch();
    } catch (err: any) {
      const msg = err?.data?.errors?.[0] || err?.data?.title || t("EmailTemplate.Actions");
      toaster.error(msg);
    }
  };

  useEffect(() => {
    if (data && data.Data) {
      if (data.Data.length > 0) {
        setRowTotal(data.Data[0]?.RowTotal || 0);
      } else {
        setRowTotal(0);
      }
    }
  }, [data]);

  const columns = [
    {
      key: "TemplateName",
      label: t("EmailTemplate.Name"),
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <MdEmail size={18} />
          </div>
            <div>
              <button
                onClick={() => navigate(`/admin/setting/emailtemplate/edit?id=${row.TemplateId}`)}
                className="font-medium la-base-class dark:text-white hover:text-primary cursor-pointer"
              >
                {row.TemplateName}
              </button>
            </div>
        </div>
      ),
    },
    {
      key: "EmailSubject",
      label: t("EmailTemplate.Subject"),
             render: (row: any) => (
               <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[220px] block">
                 {row.EmailSubject || "\u2014"}
               </span>
             ),
    },
    {
      key: "TemplateType",
      label: t("EmailTemplate.Type"),
      render: (row: any) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
             row.TemplateType?.toLowerCase() === "sys"
               ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200"
               : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {row.TemplateType || "user"}
        </span>
      ),
    },
    {
      key: "IsActive",
      label: t("EmailTemplate.Status"),
      render: (row: any) => (
        <span
          className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
             row.IsActive ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {row.IsActive ? t("Common.Active") : t("Common.Inactive")}
        </span>
      ),
    },
    {
      key: "actions",
      label: t("EmailTemplate.Actions"),
      render: (row: any) => (
        <div className="flex items-center gap-1.5">
                            <button
                              title={t("EmailTemplate.Preview")}
                              onClick={() =>
                                setPreview({
                                  name: row.TemplateName,
                                  subject: row.EmailSubject,
                                  html: row.Template,
                                })
                              }
                              className="border p-2 rounded-lg border-gray-300 dark:border-strokedark text-base cursor-pointer hover:bg-gray-50 dark:hover:bg-boxdark hover:text-brand-600 transition-colors"
                            >
                             <MdVisibility size={18} />
                           </button>
                            <button
                              title={t("Form.Edit")}
                              onClick={() => navigate(`/admin/setting/emailtemplate/edit?id=${row.TemplateId}`)}
                              className="border p-2 rounded-lg border-gray-300 dark:border-strokedark text-base cursor-pointer hover:bg-gray-50 dark:hover:bg-boxdark hover:text-blue-600 transition-colors"
                            >
                             <MdOutlineEdit size={18} />
                           </button>
                            <button
                             title={t("Form.Delete")}
            onClick={() => {
              if (row.TemplateType?.toLowerCase() === "sys") {
                toaster.error(t("EmailTemplate.Actions"));
                return;
              }
              if (confirm(t("Common.Yes"))) {
                handleDelete(row.TemplateId, row.TemplateType);
              }
            }}
             className="border p-2 rounded-lg border-gray-300 dark:border-strokedark text-red-500 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-30"
          >
            <MdDeleteOutline size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ComponentCard title={t("EmailTemplate.Title")}>
        <>
          <div className="flex flex-col gap-5 px-6 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <FilterEmailTemplate
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
                onClick={() => navigate("/admin/setting/emailtemplate/new")}
                className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
              >
                <MdCode size={18} />
                {t("EmailTemplate.AddNew")}
              </button>
            </div>
          </div>

          <DataGrid
            columns={columns}
            isLoading={isLoading}
            data={data?.Data || []}
             text={t("DataGrid.TotalRecords", { count: rowTotal })}
            currentPage={offset}
            totalPage={Math.ceil(rowTotal / limit) || 1}
            isLine={true}
            onPageChange={handlePagination}
            isShadow
          />
        </>
      </ComponentCard>

      <EmailTemplatePreview
        isOpen={!!preview}
        onClose={() => setPreview(null)}
        name={preview?.name || ""}
        subject={preview?.subject || ""}
        html={preview?.html || ""}
      />
    </div>
  );
};

export default EmailTemplateList;
