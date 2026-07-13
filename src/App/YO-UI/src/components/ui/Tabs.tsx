import React, { useState } from "react";
import { motion } from "framer-motion";

interface Tab {
    id: string;
    label: string;
    count?: number;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (id: string) => void;
    className?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange, className = "" }) => {
    return (
        <div className={`flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-2 ${className}`}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 dark:focus:ring-offset-gray-900 ${isActive
                                ? "text-primary dark:text-white"
                                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            }`}
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {tab.label}
                            {tab.count !== undefined && (
                                <span
                                    className={`px-2 py-0.5 text-xs rounded-full ${isActive
                                            ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-white"
                                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                        }`}
                                >
                                    {tab.count}
                                </span>
                            )}
                        </span>
                        {isActive && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-x-0 bottom-[-9px] h-0.5 bg-primary"
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default Tabs;
