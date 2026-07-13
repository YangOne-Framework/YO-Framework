import React, { useEffect } from "react";

interface SideModelDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    headerText?: string;
    width?: string;
    children: React.ReactNode;
}

const SideModelDrawer: React.FC<SideModelDrawerProps> = ({
    isOpen,
    onClose,
    headerText,
    width = "w-full max-w-md",
    children,
}) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-40 bg-black bg-opacity-25 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div className={`fixed inset-y-0 right-0 z-50 flex h-full bg-white shadow-xl dark:bg-boxdark ${width}`}>
                <div className="flex h-full w-full flex-col">
                    {headerText && (
                        <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-strokedark">
                            <h3 className="text-xl font-semibold text-black dark:text-white">
                                {headerText}
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    )}
                    <div className="flex-1 overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
};

export default SideModelDrawer;
