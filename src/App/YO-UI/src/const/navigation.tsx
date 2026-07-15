import i18n from "../i18n";
import {
    BoxCubeIcon,
    CalenderIcon,
    GridIcon,
    ListIcon,
} from "../icons";
import React from "react";

const _t = (key: string) => i18n.t(key);

// Simplified Icons for navigation
const AIAssistantIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 3C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H5ZM19 5V10H5V5H19ZM5 12V14H11V12H5ZM13 12V14H19V12H13ZM5 16V19H11V16H5ZM13 16V19H19V16H13Z" fill="currentColor" />
    </svg>
);

const SupportIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 4C2 3.44772 2.44772 3 3 3H22C22.5523 3 23 3.44772 23 4V14C23 14.5523 22.5523 15 22 15H2C2.44772 15 3 15.4477 3 16V21C3 21.5523 2.55228 22 2 22C1.44772 22 1 21.5523 1 21V16C1 15.4477 1.44772 15 2 15H3V4H2ZM5 6H19V8H5V6ZM5 10H19V12H5V10ZM5 17H11V19H5V17ZM13 17H19V19H13V17Z" fill="currentColor" />
    </svg>
);

const AgentIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 7H20V9H4V7ZM4 11H20V13H4V11ZM4 15H14V17H4V15Z" fill="currentColor" />
    </svg>
);

const ContentIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 3H20C21.1046 3 22 3.89543 22 5V19C22 20.1046 21.1046 21 20 21H4C2.89543 21 2 20.1046 2 19V5C2 3.89543 2.89543 3 4 3ZM4 5V8H20V5H4ZM4 16V19H20V16H4ZM4 10V13H20V10H4Z" fill="currentColor" />
    </svg>
);

const SettingsIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.7396 12.4311C19.8358 12.0964 19.8889 11.7447 19.8889 11.3872C19.8889 11.0297 19.8358 10.678 19.7396 10.3433L21.534 8.80882C21.9964 8.43368 22.1697 7.82376 21.9769 7.26057C21.784 6.69738 21.3458 6.25921 20.7826 6.06638L19.1604 5.4895C18.8335 5.38909 18.5137 5.24148 18.2061 5.05151L17.5755 3.34534C17.3094 2.76635 16.8221 2.33121 16.2397 2.11244C15.6574 1.89367 15.0249 2.00333 14.5308 2.43784L13.0551 3.64927C12.7861 3.53674 12.5127 3.44922 12.2372 3.38822V3.3872C11.7632 3.2912 11.2747 3.2912 10.7997 3.3872V3.38822C10.5242 3.44922 10.2508 3.53674 9.98178 3.64927L8.5061 2.43784C8.012 2.00333 7.37951 1.89367 6.79716 2.11244C6.21481 2.33121 5.72752 2.76635 5.46141 3.34534L4.83083 5.05151C4.52322 5.24148 4.20344 5.38909 3.87651 5.4895L2.25432 6.06638C1.69113 6.25921 1.25297 6.69738 1.06014 7.26057C0.867314 7.82376 1.04061 8.43368 1.50304 8.80882L3.29745 10.3433C3.20126 10.678 3.14817 11.0297 3.14817 11.3872C3.14817 11.7447 3.20126 12.0964 3.29745 12.4311L1.50304 13.9656C1.04061 14.3407 0.867314 14.9507 1.06014 15.5139C1.25297 16.0771 1.69113 16.5153 2.25432 16.7081L3.87651 17.285C4.20344 17.3854 4.52322 17.533 4.83083 17.7229L5.46141 19.4291C5.72752 20.0081 6.21481 20.4432 6.79716 20.662C7.37951 20.8808 8.012 20.7711 8.5061 20.3366L9.98178 19.1252C10.2508 19.2377 10.5242 19.3252 10.7997 19.3862V19.3872C11.2747 19.4832 11.7632 19.4832 12.2372 19.3872V19.3862C12.5127 19.3252 12.7861 19.2377 13.0551 19.1252L14.5308 20.3366C15.0249 20.7711 15.6574 20.8808 16.2397 20.662C16.8221 20.4432 17.3094 20.0081 17.5755 19.4291L18.2061 17.7229C18.5137 17.533 18.8335 17.3854 19.1604 17.285L19.7883 16.7081C20.3515 16.5153 20.7896 16.0771 20.9825 15.5139C21.1754 14.9507 20.9964 14.3407 20.534 13.9656L18.7396 12.4311H19.7396ZM12.2372 16.9998C14.9806 16.9998 17.2372 14.7432 17.2372 11.9998C17.2372 9.25641 14.9806 6.9998 12.2372 6.9998C9.49379 6.9998 7.23718 9.25641 7.23718 11.9998C7.23718 14.7432 9.49379 16.9998 12.2372 16.9998Z" fill="currentColor" />
    </svg>
);

const SystemIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 8H6V16H4V8ZM10 16H8V8H10V16ZM14 8H16V16H14V8ZM20 8H18V16H20V8Z" fill="currentColor" />
    </svg>
);

export type NavItem = {
    name: string;
    icon: React.ReactNode;
    path?: string;
    subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

export const adminnavItems: NavItem[] = [
    { icon: <GridIcon />, name: _t('Nav.Dashboard'), path: "/admin/dashboard" },
    {
        icon: <AIAssistantIcon />,
        name: _t('Nav.AIAssistant'),
        subItems: [
            { name: _t('Nav.AIAssistant'), path: "/admin/aiassistant", pro: false },
            { name: _t('Nav.Category'), path: "/admin/category", pro: false },
            { name: "Usage Summary", path: "/admin/usagesummary", pro: false },
        ],
    },
    {
        icon: <SupportIcon />,
        name: "Support",
        subItems: [
            { name: "Tickets", path: "/admin/supprot/ticket", pro: false },
            { name: "Support Team", path: "/admin/support/team", pro: false },
            { name: _t('Nav.Setting'), path: "/admin/support/setting", pro: false },
        ],
    },
    {
        icon: <AgentIcon />,
        name: "Agent",
        subItems: [
            { name: "Agent Tasks", path: "/admin/agent/task", pro: false },
            { name: _t('Nav.TaskBuilder'), path: "/admin/agent/taskbuilder", pro: false },
        ],
    }
];

export const sunavItems: NavItem[] = [
    { icon: <GridIcon />, name: _t('Nav.Dashboard'), path: "/admin/dashboard" },
    {
        icon: <BoxCubeIcon />,
        name: "Banner",
        subItems: [
            { name: "Banner", path: "/admin/banner", pro: false }
        ],
    },
    {
        icon: <BoxCubeIcon />,
        name: "Blog",
        subItems: [
            { name: "Posts", path: "/admin/blog", pro: false },
            { name: _t('Nav.Category'), path: "/admin/blog/category", pro: false },
            { name: _t('Nav.Setting'), path: "/admin/blog/setting", pro: false },
        ],
    },
    {
        icon: <BoxCubeIcon />,
        name: "News",
        subItems: [
            { name: "Articles", path: "/admin/news", pro: false },
            { name: _t('Nav.Category'), path: "/admin/news/category", pro: false },
            { name: _t('Nav.Setting'), path: "/admin/news/setting", pro: false },
        ],
    },
    { icon: <GridIcon />, name: "Testimonials", path: "/admin/testimonial" },
    {
        icon: <BoxCubeIcon />,
        name: "Hotel",
        subItems: [
            { name: "Hotel", path: "/admin/hotel", pro: false },
            { name: "Accessibility", path: "/admin/trek/accessibility", pro: false },
        ],
    },
    {
        icon: <BoxCubeIcon />,
        name: "Trek",
        subItems: [
            { name: _t('Nav.Category'), path: "/admin/trek/category", pro: false },
            { name: "Region", path: "/admin/trek/region", pro: false },
            { name: "Destination", path: "/admin/destination", pro: false },
            { name: "Activity Level", path: "/admin/trek/activitylevel", pro: false },
            { name: "Activity Type", path: "/admin/trek/activitytype", pro: false },
            { name: "Equipment", path: "/admin/trek/equipment", pro: false },
            { name: "Equipment Category", path: "/admin/trek/equipmentcategory", pro: false },
            { name: "Permit", path: "/admin/trek/permit", pro: false },
            { name: "In-Ex Service", path: "/admin/trek/inexservice", pro: false },
            { name: "Trek", path: "/admin/trek/trek", pro: false },
        ],
    },
    {
        icon: <CalenderIcon />,
        name: "Booking",
        subItems: [
            { name: "Bookings", path: "/admin/trek/booking", pro: false },
        ],
    },
    {
        icon: <ListIcon />,
        name: "Other",
        subItems: [
            { name: "Tour Type", path: "/admin/trek/tourtype", pro: false },
            { name: "City", path: "/admin/trek/city", pro: false },
            { name: "Currency", path: "/admin/trek/currency", pro: false },
        ],
    },
    {
        icon: <ContentIcon />,
        name: "Content Management",
        subItems: [
            { name: _t('Nav.SEO'), path: "/admin/seo", pro: false, new: true },
            { name: _t('Nav.Menu'), path: "/admin/menu", pro: false },
            { name: _t('Nav.Media'), path: "/admin/media", pro: false },
            { name: _t('Nav.HtmlBuilder'), path: "/admin/htmlbuilder", pro: false },
            { name: _t('Nav.ComponentBuilder'), path: "/admin/componentbuilder", pro: false },
            { name: "CMS Pages", path: "/admin/yopage", pro: false, new: true },
            { name: "Master Layouts", path: "/admin/layout", pro: false, new: true },
            { name: "Themes", path: "/admin/theme", pro: false, new: true },
        ],
    },
    {
        icon: <SettingsIcon />,
        name: _t('Nav.Setting'),
        subItems: [
            { name: _t('Nav.Basic'), path: "/admin/setting/basic", pro: false },
            { name: _t('Nav.CSP'), path: "/admin/setting/csp", pro: false },
            { name: _t('Nav.API'), path: "/admin/setting/api", pro: false },
            { name: _t('Nav.Optimization'), path: "/admin/setting/optimization", pro: false },
            { name: _t('Nav.File'), path: "/admin/setting/file", pro: false },
            { name: _t('Nav.Web'), path: "/admin/setting/web", pro: false },
            { name: _t('Nav.Caching'), path: "/admin/setting/caching", pro: false },
        ],
    },
    {
        icon: <SystemIcon />,
        name: _t('Nav.System'),
        subItems: [
            { name: _t('Nav.Client'), path: "/admin/client", pro: false },
            { name: _t('Nav.User'), path: "/admin/user", pro: false },
            { name: _t('Nav.Role'), path: "/admin/role", pro: false },
            { name: _t('Nav.Localization'), path: "/admin/localization", pro: false },
            { name: _t('Nav.Module'), path: "/admin/module", pro: false },
            { name: _t('Nav.EmailService'), path: "/admin/setting/emailserviceprovider", pro: false },
            { name: _t('Nav.DevLogs'), path: "/admin/logs", pro: false },
        ],
    },
    {
        icon: <BoxCubeIcon />,
        name: "Security",
        subItems: [
            { name: "IP Access", path: "/admin/setting/ipaccess", pro: false },
            { name: "Restriction", path: "/admin/setting/restriction", pro: false },
        ],
    }
];
