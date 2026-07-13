import { useState, useRef } from "react";
import { MdCloudUpload, MdCheckCircle, MdError, MdWarning } from "react-icons/md";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import toaster from "../../../components/toster";
import {
  useUploadModuleMutation,
  useInstallModuleMutation,
} from "../../../redux/setting/moduleAPI";
import { ModulePackageValidationResult } from "../../../types/moduleTypes";

interface InstallModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const InstallModuleModal = ({ isOpen, onClose, onSuccess }: InstallModuleModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ModulePackageValidationResult | null>(null);
  const [step, setStep] = useState<"upload" | "validate" | "installing">("upload");

  const [uploadModule, { isLoading: uploading }] = useUploadModuleMutation();
  const [installModule, { isLoading: installing }] = useInstallModuleMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".zip")) {
        toaster.error("Please select a .zip package file");
        return;
      }
      setSelectedFile(file);
      setValidationResult(null);
      setStep("upload");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      const formData = new FormData();
      formData.append("PackageFile", selectedFile);
      const result = await uploadModule(formData).unwrap();
      const validation: ModulePackageValidationResult = result?.Data || result;
      setValidationResult(validation);
      if (validation?.IsValid) {
        setStep("validate");
        toaster.success("Package validated successfully");
      } else {
        toaster.error("Package validation failed");
      }
    } catch (err: any) {
      toaster.error(err?.data?.Message || err?.message || "Upload failed");
    }
  };

  const handleInstall = async () => {
    if (!validationResult?.Manifest?.Id) return;
    try {
      setStep("installing");
      await installModule({
        moduleName: validationResult.Manifest.Id,
        version: validationResult.Version || undefined,
      }).unwrap();
      toaster.success("Module installed successfully");
      handleReset();
      onSuccess();
    } catch (err: any) {
      toaster.error(err?.data?.Message || err?.message || "Installation failed");
      setStep("validate");
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setValidationResult(null);
    setStep("upload");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const manifest = validationResult?.Manifest;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="p-6 max-w-lg">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-6">
        Upload & Install Module
      </h3>

      {step === "upload" && (
        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-primary dark:hover:border-primary transition-colors"
          >
            <MdCloudUpload size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              {selectedFile ? selectedFile.name : "Click to select a module package (.zip)"}
            </p>
            <p className="text-xs text-gray-400">Maximum file size: 100MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <MdCheckCircle className="text-green-500" size={20} />
                <span className="text-sm text-gray-700 dark:text-gray-300">{selectedFile.name}</span>
              </div>
              <span className="text-xs text-gray-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
              {uploading ? "Uploading..." : "Upload & Validate"}
            </Button>
          </div>
        </div>
      )}

      {step === "validate" && validationResult && (
        <div className="space-y-4">
          {validationResult.IsValid ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
              <MdCheckCircle className="text-green-500 shrink-0" size={24} />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Package is valid</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {manifest?.DisplayName} v{manifest?.Version}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
              <MdError className="text-red-500 shrink-0" size={24} />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">Validation failed</p>
                {validationResult.Errors?.map((err, i) => (
                  <p key={i} className="text-xs text-red-600 dark:text-red-400">{err}</p>
                ))}
              </div>
            </div>
          )}

          {validationResult.Warnings?.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <MdWarning className="text-yellow-500" size={18} />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Warnings</span>
              </div>
              {validationResult.Warnings.map((w, i) => (
                <p key={i} className="text-xs text-yellow-600 dark:text-yellow-400 ml-6">{w}</p>
              ))}
            </div>
          )}

          {manifest && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-medium text-gray-800 dark:text-white/90">Module Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Name:</span>
                <span className="text-gray-800 dark:text-white/90">{manifest.Id}</span>
                <span className="text-gray-500">Display Name:</span>
                <span className="text-gray-800 dark:text-white/90">{manifest.DisplayName}</span>
                <span className="text-gray-500">Version:</span>
                <span className="text-gray-800 dark:text-white/90">{manifest.Version}</span>
                <span className="text-gray-500">Publisher:</span>
                <span className="text-gray-800 dark:text-white/90">{manifest.Publisher}</span>
                <span className="text-gray-500">CMS Version:</span>
                <span className="text-gray-800 dark:text-white/90">
                  {manifest.CmsMinimumVersion} - {manifest.CmsMaximumVersion}
                </span>
                <span className="text-gray-500">Restart Required:</span>
                <span>
                  {manifest.RestartRequired ? (
                    <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Yes</span>
                  ) : (
                    <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">No</span>
                  )}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleReset}>Back</Button>
            {validationResult.IsValid && (
              <Button onClick={handleInstall} disabled={installing}>
                {installing ? "Installing..." : "Install Module"}
              </Button>
            )}
          </div>
        </div>
      )}

      {step === "installing" && (
        <div className="py-12 text-center space-y-4">
          <div className="animate-spin w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-gray-600 dark:text-gray-300">Installing module...</p>
        </div>
      )}
    </Modal>
  );
};

export default InstallModuleModal;
