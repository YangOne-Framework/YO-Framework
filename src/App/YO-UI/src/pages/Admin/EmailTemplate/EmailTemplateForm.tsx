import { useEffect, useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import Editor, { OnMount } from "@monaco-editor/react";
import { MdVisibility, MdCode, MdPreview, MdSave, MdArrowBack, MdEdit } from "react-icons/md";
import {
  useGetEmailTemplateByIdQuery,
  useGetEmailTemplateDefaultsQuery,
  useSaveEmailTemplateMutation,
} from "../../../redux/email/emailTemplateAPI";
import EmailTemplatePreview from "./EmailTemplatePreview";
import EmailTemplateBuilder, { stripYoWrappers, combineTemplate } from "./EmailTemplateBuilder";
import toaster from "../../../components/toster";
import InputField from "../../../components/form/input/InputField";
import Checkbox from "../../../components/form/input/Checkbox";
import ComponentCard from "../../../components/common/ComponentCard";
import { useTranslation } from "react-i18next";

type FormValues = {
  TemplateName: string;
  EmailSubject: string;
  TemplateType: string;
  Template: string;
  HeaderTemplate: string;
  FooterTemplate: string;
  IsActive: boolean;
};

const defaultValues: FormValues = {
  TemplateName: "",
  EmailSubject: "",
  TemplateType: "user",
  Template: `<div data-yo-c="true" data-yo-id="comp_default_0" data-yo-type="heading" data-yo-name="Heading" data-yo-config="{&quot;level&quot;:&quot;h2&quot;,&quot;text&quot;:&quot;Hello {{name}},&quot;,&quot;align&quot;:&quot;left&quot;,&quot;color&quot;:&quot;#1e293b&quot;}"><h2 style="margin:0 0 12px;font-size:20px;font-weight:600;color:#1e293b;text-align:left;">Hello {{name}},</h2></div>\n<div data-yo-c="true" data-yo-id="comp_default_1" data-yo-type="text" data-yo-name="Text" data-yo-config="{&quot;content&quot;:&quot;{{message}}&quot;,&quot;align&quot;:&quot;left&quot;,&quot;color&quot;:&quot;#475569&quot;,&quot;fontSize&quot;:&quot;14px&quot;}"><p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#475569;text-align:left;">{{message}}</p></div>`,
  HeaderTemplate: "",
  FooterTemplate: "",
  IsActive: true,
};

const EmailTemplateForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");
  const [templateId, setTemplateId] = useState<number>(0);
  const [editorTab, setEditorTab] = useState<"builder" | "source" | "preview">("builder");
  const [builderKey, setBuilderKey] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const editorRef = useRef<any>(null);
  const sourceEditorRef = useRef<any>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues });

  const templateBody = watch("Template");
  const headerHtml = watch("HeaderTemplate");
  const footerHtml = watch("FooterTemplate");
  const subjectValue = watch("EmailSubject");
  const nameValue = watch("TemplateName");

  const { data: templateData, isSuccess: templateLoaded } = useGetEmailTemplateByIdQuery(templateId, {
    skip: !templateId,
  });

  const { data: defaultsData } = useGetEmailTemplateDefaultsQuery(undefined, {
    skip: !!templateId,
  });

  const [saveTemplate, { isLoading: saving }] = useSaveEmailTemplateMutation();

  useEffect(() => {
    if (id) {
      setTemplateId(parseInt(id, 10));
    }
  }, [id]);

  useEffect(() => {
    if (templateLoaded && templateData?.Data) {
      const t = templateData.Data;
      reset({
        TemplateName: t.TemplateName,
        EmailSubject: t.EmailSubject || "",
        TemplateType: t.TemplateType || "user",
        Template: t.Template || "",
        HeaderTemplate: t.HeaderTemplate || "",
        FooterTemplate: t.FooterTemplate || "",
        IsActive: t.IsActive,
      });
    }
  }, [templateData, templateLoaded, reset]);

  useEffect(() => {
    if (defaultsData?.Data && !templateId) {
      const d = defaultsData.Data;
      setValue("HeaderTemplate", d.Header || "");
      setValue("FooterTemplate", d.Footer || "");
    }
  }, [defaultsData, templateId, setValue]);

  const switchTab = useCallback((tab: "builder" | "source" | "preview") => {
    setEditorTab(tab);
    if (tab === "builder") {
      setBuilderKey((prev) => prev + 1);
    }
  }, []);

  const handleEditorMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
  }, []);

  const handleEditorChange = (val: string | undefined) => {
    setValue("Template", val || "", { shouldDirty: true });
  };

  const sourceValue = `<!--HEADER-->\n${headerHtml || ""}\n<!--/HEADER-->\n<!--BODY-->\n${templateBody || ""}\n<!--/BODY-->\n<!--FOOTER-->\n${footerHtml || ""}\n<!--/FOOTER-->`;

  const handleSourceEditorMount: OnMount = useCallback((editor) => {
    sourceEditorRef.current = editor;
  }, []);

  const handleSourceChange = (val: string | undefined) => {
    if (!val) return;
    const headM = val.match(/<!--HEADER-->([\s\S]*?)<!--\/HEADER-->/);
    const bodyM = val.match(/<!--BODY-->([\s\S]*?)<!--\/BODY-->/);
    const footM = val.match(/<!--FOOTER-->([\s\S]*?)<!--\/FOOTER-->/);
    if (headM) setValue("HeaderTemplate", headM[1].trim(), { shouldDirty: true });
    if (bodyM) setValue("Template", bodyM[1].trim(), { shouldDirty: true });
    if (footM) setValue("FooterTemplate", footM[1].trim(), { shouldDirty: true });
  };

  const handleFormatHtml = () => {
    const editor = editorTab === "source" ? sourceEditorRef.current : editorRef.current;
    if (editor) {
      editor.getAction("editor.action.formatDocument")?.run();
    }
  };

  const combinedHtml = combineTemplate(headerHtml || "", templateBody || "", footerHtml || "", t);

  const onSubmit = async (data: FormValues) => {
    try {
      await saveTemplate({
        TemplateId: templateId || undefined,
        TemplateName: data.TemplateName,
        EmailSubject: data.EmailSubject,
        TemplateType: data.TemplateType,
        Template: data.Template,
        HeaderTemplate: data.HeaderTemplate,
        FooterTemplate: data.FooterTemplate,
        IsActive: data.IsActive,
      }).unwrap();

      toaster.success(templateId ? t("EmailTemplateForm.EditTitle") : t("EmailTemplateForm.AddTitle"));
      navigate("/admin/setting/emailtemplate");
    } catch (err: any) {
      const msg = err?.data?.errors?.[0] || err?.data?.Errors?.[0] || err?.data?.title || t("EmailTemplateForm.Title");
      if (msg.toLowerCase().includes("already exists")) {
        setError("TemplateName", { message: msg });
      } else {
        toaster.error(msg);
      }
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <ComponentCard title={templateId ? t("EmailTemplateForm.EditTitle") : t("EmailTemplateForm.AddTitle")}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              type="text"
              id="templateName"
              labelName={t("EmailTemplateForm.TemplateName")}
              placeholder={t("EmailTemplateForm.TemplateNamePlaceholder")}
              {...register("TemplateName", { required: t("EmailTemplateForm.TemplateName") })}
              error={!!errors.TemplateName}
              errorMsg={errors.TemplateName?.message as string}
            />
            <InputField
              type="text"
              id="emailSubject"
              labelName={t("EmailTemplateForm.EmailSubject")}
              placeholder={t("EmailTemplateForm.EmailSubjectPlaceholder")}
              {...register("EmailSubject", { required: t("EmailTemplateForm.EmailSubject") })}
              error={!!errors.EmailSubject}
              errorMsg={errors.EmailSubject?.message as string}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {t("EmailTemplateForm.TemplateType")}
              </label>
              <select
                className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                {...register("TemplateType")}
                disabled={templateId ? templateData?.Data?.TemplateType === "sys" : false}
              >
                <option value="user">{t("EmailTemplateForm.TypeUser")}</option>
                <option value="sys">{t("EmailTemplateForm.TypeSystem")}</option>
              </select>
            </div>
            <div className="flex items-center gap-6 pt-6">
              <Checkbox label={t("EmailTemplateForm.IsActive")} {...register("IsActive")} id="isActive" />
            </div>
          </div>
        </ComponentCard>

        <div className="grid grid-cols-1 gap-4">
          <ComponentCard title={t("EmailTemplateForm.HeaderCardTitle")}>
            <div className="max-h-32 overflow-y-auto rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-xs text-gray-500 dark:text-gray-400 font-mono whitespace-pre-wrap">
              {headerHtml ? headerHtml.slice(0, 500) + (headerHtml.length > 500 ? "..." : "") : t("EmailTemplateForm.NoHeaderTemplate")}
            </div>
          </ComponentCard>
        </div>

        <ComponentCard title={t("EmailTemplateForm.BodyCardTitle")}>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
              <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-0.5">
                <button
                  type="button"
                  onClick={() => switchTab("builder")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    editorTab === "builder" ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                >
                  <MdEdit size={16} />
                  {t("EmailTemplateBuilder.Layout")}
                </button>
                <button
                  type="button"
                  onClick={() => switchTab("source")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    editorTab === "source" ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                >
                  <MdCode size={16} />
                  {t("EmailTemplateForm.CodeEditor")}
                </button>
                <button
                  type="button"
                  onClick={() => switchTab("preview")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    editorTab === "preview" ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                >
                  <MdPreview size={16} />
                  {t("EmailTemplateForm.Preview")}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <MdVisibility size={16} />
                  {t("EmailTemplateForm.Preview")}
                </button>
                {editorTab === "source" && (
                  <button
                    type="button"
                    onClick={handleFormatHtml}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {t("EmailTemplateForm.Format")}
                  </button>
                )}
              </div>
            </div>

            {editorTab === "builder" && (
              <EmailTemplateBuilder
                key={builderKey}
                value={templateBody}
                onChange={(html) => setValue("Template", html, { shouldDirty: true })}
              />
            )}

            {editorTab === "source" && (
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                <Editor
                  height={500}
                  language="html"
                  value={sourceValue}
                  theme="vs-dark"
                  onMount={handleSourceEditorMount}
                  onChange={handleSourceChange}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    automaticLayout: true,
                    tabSize: 2,
                    formatOnPaste: true,
                    formatOnType: true,
                    bracketPairColorization: { enabled: true },
                    guides: { bracketPairs: true, indentation: true },
                  }}
                />
              </div>
            )}

            {editorTab === "preview" && (
              <div
                ref={previewRef}
                className="min-h-[500px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6"
              >
                {combinedHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: stripYoWrappers(combinedHtml) }} />
                ) : (
                  <div className="flex items-center justify-center text-sm text-gray-400 dark:text-gray-500 h-40">
                    {t("EmailTemplatePreview.NoContent")}
                  </div>
                )}
              </div>
            )}
          </div>
        </ComponentCard>

        <div className="grid grid-cols-1 gap-4">
          <ComponentCard title={t("EmailTemplateForm.FooterCardTitle")}>
            <div className="max-h-32 overflow-y-auto rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-xs text-gray-500 dark:text-gray-400 font-mono whitespace-pre-wrap">
              {footerHtml ? footerHtml.slice(0, 500) + (footerHtml.length > 500 ? "..." : "") : t("EmailTemplateForm.NoFooterTemplate")}
            </div>
          </ComponentCard>
        </div>

        <div className="mt-3 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/setting/emailtemplate")}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            <MdArrowBack size={18} /> {t("Form.Back")}
          </button>
          <button
            type="submit"
            className="bg-brand-500 hover:bg-brand-600 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
            disabled={saving || isSubmitting}
          >
            <MdSave size={18} />
            {templateId ? t("Form.Update") : t("Form.Save")}
          </button>
        </div>
      </form>

      <EmailTemplatePreview
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        name={nameValue}
        subject={subjectValue}
        html={combinedHtml}
      />
    </div>
  );
};

export default EmailTemplateForm;
