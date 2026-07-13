import i18n from "../../../i18n";
import React, { useEffect, useState } from "react";
import { useForm, Controller, UseFormReturn } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    useUpdateApplicationMutation,
    useGetApplicationDetailsQuery,
    useGetPermissionsQuery
} from "../../../redux/setting/clientAPI";
import TagsInput from "../../../components/ui/TagsInput";
import {
    ArrowLeft,
    Save,
    Check,
    Smartphone,
    Globe,
    Server,
    Layout,
    Box,
    Monitor,
    ChevronRight,
    ChevronLeft
} from "lucide-react";
import toaster from "../../../components/toster";

// --- Types ---

type ClientTemplateType = "empty" | "spa" | "web" | "m2m" | "mobile" | "device";

interface ClientTemplate {
    id: ClientTemplateType;
    title: string;
    description: string;
    icon: React.ElementType;
    defaultValues: Partial<ClientFormData>;
}

interface ClientFormData {
    id?: string; // Required for edit mode
    clientId: string;
    clientSecret: string;
    displayName: string;
    clientType: "public" | "confidential";
    consentType: "explicit" | "external" | "implicit" | "systematic";
    redirectUris: string[];
    postLogoutRedirectUris: string[];
    permissions: string[];
    requirements: string[]; // For PKCE etc
}

// --- Templates Configuration ---

const TEMPLATES: ClientTemplate[] = [
    {
        id: "empty",
        title: i18n.t('ClientForm.Empty', 'Empty Client'),
        description: i18n.t('ClientForm.EmptyDesc', 'Start from scratch with a clean slate.'),
        icon: Box,
        defaultValues: {
            clientType: "public",
            consentType: "explicit",
            permissions: [],
            requirements: [],
        }
    },
    {
        id: "spa",
        title: i18n.t('ClientForm.SPA', 'Single Page Application'),
        description: i18n.t('ClientForm.SPADesc', 'React, Angular, Vue, Blazor WASM. Uses PKCE.'),
        icon: Layout,
        defaultValues: {
            clientType: "public",
            consentType: "explicit",
            requirements: ["pkce"],
            permissions: [
                "ept:authorization",
                "ept:logout",
                "gt:authorization_code",
                "gt:refresh_token",
                "rst:code",
                "scp:openid",
                "scp:profile",
                "scp:email",
            ]
        }
    },
    {
        id: "web",
        title: i18n.t('ClientForm.WebApp', 'Web Application'),
        description: i18n.t('ClientForm.WebAppDesc', 'Server-side apps (MVC, Next.js). Uses Client Secret.'),
        icon: Globe,
        defaultValues: {
            clientType: "confidential",
            consentType: "explicit",
            requirements: [],
            permissions: [
                "ept:authorization",
                "ept:token",
                "ept:logout",
                "gt:authorization_code",
                "gt:refresh_token",
                "rst:code",
                "scp:openid",
                "scp:profile",
                "scp:email",
                "scp:offline_access"
            ]
        }
    },
    {
        id: "m2m",
        title: i18n.t('ClientForm.M2M', 'Service / Machine-to-Machine'),
        description: i18n.t('ClientForm.M2MDesc', 'Daemon services, cron jobs. client_credentials flow.'),
        icon: Server,
        defaultValues: {
            clientType: "confidential",
            consentType: "systematic",
            permissions: [
                "ept:token",
                "gt:client_credentials",
                "scp:offline_access" // optionally?
            ],
            requirements: []
        }
    },
    {
        id: "mobile",
        title: i18n.t('ClientForm.Mobile', 'Mobile / Native'),
        description: i18n.t('ClientForm.MobileDesc', 'iOS, Android. Uses PKCE and custom schemes.'),
        icon: Smartphone,
        defaultValues: {
            clientType: "public",
            consentType: "explicit",
            requirements: ["pkce"],
            permissions: [
                "ept:authorization",
                "ept:logout",
                "gt:authorization_code",
                "gt:refresh_token",
                "rst:code",
                "scp:openid",
                "scp:profile",
                "scp:email",
                "scp:offline_access"
            ]
        }
    },
    {
        id: "device",
        title: i18n.t('ClientForm.Device', 'Device / IoT'),
        description: i18n.t('ClientForm.DeviceDesc', 'Devices with limited input capabilities.'),
        icon: Monitor,
        defaultValues: {
            clientType: "public",
            consentType: "explicit",
            permissions: [
                "ept:authorization",
                "ept:token",
                "gt:urn:ietf:params:oauth:grant-type:device_code",
                "gt:refresh_token",
                "scp:openid",
                "scp:profile",
            ],
            requirements: []
        }
    }
];

// --- Sub-Components ---

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
    const steps = [i18n.t('ClientForm.StepType', 'Type'), i18n.t('ClientForm.StepBasics', 'Basics'), i18n.t('ClientForm.StepSettings', 'Settings'), i18n.t('ClientForm.StepReview', 'Review')];
    return (
        <div className="flex items-center justify-center mb-8">
            {steps.map((label, index) => (
                <div key={label} className="flex items-center">
                    <div className={`flex flex-col items-center relative z-10`}>
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${index <= currentStep
                                ? "bg-brand-500 border-brand-500 text-white"
                                : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500"
                                }`}
                        >
                            {index < currentStep ? <Check size={20} /> : <span>{index + 1}</span>}
                        </div>
                        <span className={`text-xs mt-2 font-medium ${index <= currentStep ? "text-brand-500" : "text-gray-500 dark:text-gray-400"}`}>
                            {label}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                        <div
                            className={`w-20 h-1 mx-2 -mt-6 transition-colors ${index < currentStep ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-700"
                                }`}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

const TemplateSelector = ({ onSelect, selectedId }: { onSelect: (t: ClientTemplate) => void; selectedId?: string }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEMPLATES.map((template) => {
                const Icon = template.icon;
                const isSelected = selectedId === template.id;
                return (
                    <motion.div
                        key={template.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect(template)}
                        className={`cursor-pointer rounded-xl border-2 p-6 flex flex-col items-center text-center transition-all ${isSelected
                            ? "border-brand-500 bg-brand-50/50 dark:bg-brand-500/10"
                            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-brand-500/50"
                            }`}
                    >
                        <div
                            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isSelected ? "bg-brand-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                }`}
                        >
                            <Icon size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{template.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{template.description}</p>
                    </motion.div>
                );
            })}
        </div>
    );
};

const BasicInfoStep = ({ register, errors, isEditMode }: { register: UseFormReturn<ClientFormData>["register"]; errors: any; isEditMode: boolean }) => {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {i18n.t('ClientForm.ClientId', 'Client ID')} <span className="text-red-500">*</span>
                </label>
                <input
                    {...register("clientId", {
                        required: i18n.t('ClientForm.ClientIdRequired', 'Client ID is required'),
                        pattern: {
                            value: /^[a-zA-Z0-9-_]+$/,
                            message: i18n.t('ClientForm.ClientIdPattern', 'Only alphanumeric characters, dashes, and underscores allowed'),
                        },
                    })}
                    disabled={isEditMode}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-brand-500/50 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                    placeholder={i18n.t('ClientForm.ClientIdPlaceholder', 'e.g. my-awesome-app')}
                />
                {isEditMode && <p className="text-xs text-gray-500 dark:text-gray-400">{i18n.t('ClientForm.ClientIdLocked', 'Client ID cannot be changed after creation')}</p>}
                {errors.clientId && <span className="text-xs text-red-500">{errors.clientId.message}</span>}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{i18n.t('ClientForm.DisplayName', 'Display Name')}</label>
                <input
                    {...register("displayName", { required: i18n.t('ClientForm.DisplayNameRequired', 'Display name is required') })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-brand-500/50 outline-none"
                    placeholder={i18n.t('ClientForm.DisplayNamePlaceholder', 'e.g. My Awesome App')}
                />
                {errors.displayName && <span className="text-xs text-red-500">{errors.displayName.message}</span>}
            </div>
        </div>
    );
};

const SettingsStep = ({
    control,
    register,
    watch,
    allPermissions,
    isEditMode
}: {
    control: any;
    register: any;
    watch: any;
    allPermissions: string[];
    isEditMode: boolean;
}) => {
    const clientType = watch("clientType");
    // const requirements = watch("requirements");

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <h3 className="text-lg font-semibold border-b pb-2 dark:border-gray-700">{i18n.t('ClientForm.DetailedConfig', 'Detailed Configuration')}</h3>

                {clientType === "confidential" && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{i18n.t('ClientForm.ClientSecret', 'Client Secret')}</label>
                        <input
                            {...register("clientSecret")}
                            type="password"
                            placeholder={isEditMode ? i18n.t('ClientForm.ClientSecretEditPlaceholder', 'Leave empty to keep unchanged') : i18n.t('ClientForm.ClientSecretNewPlaceholder', 'Leave empty to generate automatically')}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-brand-500/50 outline-none"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">{i18n.t('ClientForm.ClientSecretHint', 'Required for confidential clients (Web Apps, APIs, etc).')}</p>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{i18n.t('ClientForm.ClientType', 'Client Type')}</label>
                    <select
                        {...register("clientType")}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-brand-500/50 outline-none"
                    >
                        <option value="public">{i18n.t('ClientForm.PublicClientType', 'Public (SPA, Mobile)')}</option>
                        <option value="confidential">{i18n.t('ClientForm.ConfidentialClientType', 'Confidential (Web App, M2M)')}</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{i18n.t('ClientForm.ConsentType', 'Consent Type')}</label>
                    <select
                        {...register("consentType")}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-brand-500/50 outline-none"
                    >
                        <option value="explicit">{i18n.t('ClientForm.ConsentExplicit', 'Explicit (User must approve)')}</option>
                        <option value="external">{i18n.t('ClientForm.ConsentExternal', 'External')}</option>
                        <option value="implicit">{i18n.t('ClientForm.ConsentImplicit', 'Implicit')}</option>
                        <option value="systematic">{i18n.t('ClientForm.ConsentSystematic', 'Systematic (Trust implicitly)')}</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <Controller
                        control={control}
                        name="redirectUris"
                        render={({ field: { value, onChange } }) => (
                            <TagsInput
                                value={value}
                                onChange={onChange}
                                label={i18n.t('ClientForm.RedirectURIs', 'Redirect URIs')}
                                placeholder={i18n.t('ClientForm.RedirectURIPlaceholder', 'https://app.com/callback')}
                                shouldCreateNew={true}
                                predefinedTags={[]}
                            />
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <Controller
                        control={control}
                        name="postLogoutRedirectUris"
                        render={({ field: { value, onChange } }) => (
                            <TagsInput
                                value={value}
                                onChange={onChange}
                                label={i18n.t('ClientForm.PostLogoutURIs', 'Post Logout Redirect URIs')}
                                placeholder={i18n.t('ClientForm.PostLogoutURIPlaceholder', 'https://app.com/logout-callback')}
                                shouldCreateNew={true}
                                predefinedTags={[]}
                            />
                        )}
                    />
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-lg font-semibold border-b pb-2 dark:border-gray-700">{i18n.t('ClientForm.Permissions', 'Permissions & Capabilities')}</h3>
                <div className="h-[400px] overflow-y-auto border rounded-lg p-4 custom-scrollbar dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <Controller
                        control={control}
                        name="permissions"
                        render={({ field: { value, onChange } }) => (
                            <div className="space-y-2">
                                {allPermissions.map((perm) => (
                                    <label key={perm} className="flex items-start gap-3 p-2 hover:bg-white dark:hover:bg-gray-700 rounded cursor-pointer group transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={value?.includes(perm)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    onChange([...(value || []), perm]);
                                                } else {
                                                    onChange(value?.filter((p: string) => p !== perm));
                                                }
                                            }}
                                            className="mt-1 w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300 break-all group-hover:text-brand-500">
                                            {perm}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    />
                </div>
            </div>
        </div>
    );
};

const ReviewStep = ({ getValues }: { getValues: UseFormReturn<ClientFormData>["getValues"] }) => {
    const values = getValues();
    return (
        <div className="max-w-3xl mx-auto bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-6 text-center dark:text-gray-100">{i18n.t('ClientForm.ReviewTitle', 'Review Client Configuration')}</h3>

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{i18n.t('ClientForm.ClientId', 'Client ID')}</dt>
                    <dd className="mt-1 text-base font-semibold dark:text-gray-200">{values.clientId}</dd>
                </div>
                <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{i18n.t('ClientForm.DisplayName', 'Display Name')}</dt>
                    <dd className="mt-1 text-base font-semibold dark:text-gray-200">{values.displayName}</dd>
                </div>
                <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{i18n.t('ClientForm.Type', 'Type')}</dt>
                    <dd className="mt-1 text-base font-semibold capitalize dark:text-gray-200">{values.clientType}</dd>
                </div>
                <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{i18n.t('ClientForm.Consent', 'Consent')}</dt>
                    <dd className="mt-1 text-base font-semibold capitalize dark:text-gray-200">{values.consentType}</dd>
                </div>

                <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{i18n.t('ClientForm.RedirectURIs', 'Redirect URIs')}</dt>
                    <dd className="mt-1 flex flex-wrap gap-2">
                        {values.redirectUris?.length > 0 ? values.redirectUris.map(uri => (
                            <span key={uri} className="px-2 py-1 bg-brand-50 text-brand-700 rounded text-sm dark:bg-brand-500/20 dark:text-brand-300">{uri}</span>
                        )) : <span className="text-gray-400 dark:text-gray-500 italic">{i18n.t('ClientForm.NoneConfigured', 'None configured')}</span>}
                    </dd>
                </div>

                <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{i18n.t('ClientForm.PermissionsCount', 'Permissions')} ({values.permissions?.length})</dt>
                        <dd className="mt-1 max-h-40 overflow-y-auto text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded border">
                        {values.permissions?.join(", ")}
                    </dd>
                </div>
            </dl>
        </div>
    );
};

// --- Main Wizard Component ---

const ClientForm = () => {
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(0);
    const [selectedTemplate, setSelectedTemplate] = useState<ClientTemplateType | null>(null);

    // Queries
    const { data: clientDetailsResponse, isLoading: isLoadingDetails } = useGetApplicationDetailsQuery(id || "", { skip: !isEditMode });
    const { data: permissionsResponse } = useGetPermissionsQuery();
    const allPermissions = permissionsResponse?.Data || [];

    // Mutations
    const [createClient, { isLoading: isCreating }] = useUpdateApplicationMutation();
    const [updateClient, { isLoading: isUpdating }] = useUpdateApplicationMutation();

    const methods = useForm<ClientFormData>({
        defaultValues: {
            clientId: "",
            clientSecret: "",
            displayName: "",
            clientType: "public",
            consentType: "explicit",
            redirectUris: [],
            postLogoutRedirectUris: [],
            permissions: [],
            requirements: []
        },
        mode: "onChange"
    });

    const { register, handleSubmit, control, watch, reset, getValues, formState: { errors, isValid }, trigger } = methods;

    // Load data in Edit Mode
    useEffect(() => {
        if (isEditMode && clientDetailsResponse?.Data) {
            const details = clientDetailsResponse.Data;
            reset({
                id: details.Id, // Include Id for edit mode
                clientId: details.ClientId,
                displayName: details.DisplayName,
                clientType: details.ClientType as "public" | "confidential",
                consentType: details.ConsentType as any,
                redirectUris: details.RedirectUris || [],
                postLogoutRedirectUris: details.PostLogoutRedirectUris || [],
                permissions: details.Permissions || [],
                requirements: details.Requirements || [],
                clientSecret: "", // Always empty on edit
            });
            setCurrentStep(1);
        }
    }, [clientDetailsResponse, isEditMode, reset]);

    const handleTemplateSelect = (template: ClientTemplate) => {
        setSelectedTemplate(template.id);
        reset({
            ...getValues(), // Keep any typed basic info (unlikely here)
            ...template.defaultValues,
        });
        setCurrentStep(1);
    };

    const nextStep = async () => {
        const isStepValid = await trigger(); // Trigger validation for current fields
        if (isStepValid) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
    };

    const onSubmit = async (data: ClientFormData) => {
        try {
            const payload: any = {
                ...data,
                clientSecret: data.clientSecret || undefined, // undefined to ignore if empty
            };

            // Only include id in edit mode
            if (!isEditMode) {
                delete payload.id;
            }

            let response;
            if (isEditMode) {
                response = await updateClient(payload).unwrap();
            } else {
                response = await createClient(payload).unwrap();
            }
            console.log(response)
            if (response.Code == 200) {
                toaster.success(isEditMode ? i18n.t('ClientForm.UpdateSuccess', 'Client updated successfully!') : i18n.t('ClientForm.CreateSuccess', 'Client created successfully!'));
                navigate("/admin/client");
            } else {
                toaster.error(response.Message);
            }
        } catch (err: any) {
            console.error(err);
            toaster.error(err?.data?.message || i18n.t('ClientForm.SaveError', 'An error occurred while saving the client.'));
        }
    };

    if (isEditMode && isLoadingDetails) return <div className="p-10 text-center">{i18n.t('Common.Loading', 'Loading...')}</div>;

    const isSaving = isCreating || isUpdating;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link to="/admin/client" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                        <ArrowLeft />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold dark:text-white">{isEditMode ? i18n.t('ClientForm.EditTitle', 'Edit Client') : i18n.t('ClientForm.AddTitle', 'Create New Client')}</h1>
                        <p className="text-gray-500 dark:text-gray-400">{i18n.t('ClientForm.StepOf', 'Step {{current}} of {{total}}').replace('{{current}}', String(currentStep + 1)).replace('{{total}}', '4')}</p>
                    </div>
                </div>
            </div>

            <StepIndicator currentStep={currentStep} />

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 min-h-[500px] flex flex-col">
                <div className="p-8 flex-1">
                    <AnimatePresence mode="wait">
                        {currentStep === 0 && !isEditMode && (
                            <motion.div
                                key="step0"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <h2 className="text-2xl font-semibold mb-6 text-center">{i18n.t('ClientForm.SelectTemplate', 'Select a Template')}</h2>
                                <TemplateSelector onSelect={handleTemplateSelect} selectedId={selectedTemplate || ""} />
                            </motion.div>
                        )}

                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <h2 className="text-2xl font-semibold mb-6 text-center">{i18n.t('ClientForm.BasicInfo', 'Basic Information')}</h2>
                                <BasicInfoStep register={register} errors={errors} isEditMode={isEditMode} />
                            </motion.div>
                        )}

                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <SettingsStep
                                    control={control}
                                    register={register}
                                    watch={watch}
                                    allPermissions={allPermissions}
                                    isEditMode={isEditMode}
                                />
                            </motion.div>
                        )}

                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <ReviewStep getValues={getValues} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl flex justify-between">
                    {currentStep > 0 ? (
                        <button
                            onClick={prevStep}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700 transition"
                        >
                            <ChevronLeft size={18} /> {i18n.t('ClientForm.Previous', 'Back')}
                        </button>
                    ) : (
                        <div /> // Spacer
                    )}

                    {currentStep < 3 ? (
                        <button
                            onClick={nextStep}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition shadow-lg shadow-brand-500/20"
                        >
                            {i18n.t('ClientForm.Next', 'Next')} <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit(onSubmit)}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition shadow-lg shadow-brand-500/20 disabled:opacity-70"
                        >
                            <Save size={18} /> {isSaving ? i18n.t('Common.Saving', 'Saving...') : i18n.t('ClientForm.ConfirmSave', 'Confirm & Save')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientForm;
