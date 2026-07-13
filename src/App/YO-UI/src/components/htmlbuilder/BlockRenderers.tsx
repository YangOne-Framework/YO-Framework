
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { createRoot } from 'react-dom/client';
import { BlockRendererProps } from '../../types/builderTypes';
import * as LucideIcons from 'lucide-react';

// --- Dynamic Icon Helper ---
const DynamicIcon: React.FC<{ name: string; size?: number; className?: string }> = ({ name, size = 24, className }) => {
    // @ts-ignore
    const IconComponent = LucideIcons[name] || LucideIcons.HelpCircle;
    return <IconComponent size={size} className={className} />;
};

// --- Helpers ---
const getAlignClass = (align: string) => {
    switch (align) {
        case 'text-center': return 'text-center';
        case 'text-right': return 'text-right';
        default: return 'text-left';
    }
};

const getPaddingClass = (padding: string) => padding || 'p-5';

const getBgClass = (bg: string) => {
    if (bg === 'layout--background-main') return 'bg-white';
    if (bg === 'layout--background-alt') return 'bg-gray-50';
    if (bg === 'layout--background-dark') return 'bg-slate-900 text-white';
    if (bg === 'layout--background-accent') return 'bg-blue-50';
    return 'bg-white';
};

// --- Helper: Video Embedder ---
const VideoPlayer: React.FC<{ url: string; autoPlay?: string }> = ({ url, autoPlay }) => {
    const { t } = useTranslation();
    if (!url) return <div className="aspect-video bg-gray-200 flex items-center justify-center text-gray-500">{t("HtmlBuilder.NoUrl")}</div>;

    let embedUrl = url;
    const isAutoPlay = autoPlay === 'true';

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
        embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0${isAutoPlay ? '&autoplay=1&mute=1' : ''}`;
    } else if (url.includes('vimeo.com')) {
        const videoId = url.split('/').pop();
        embedUrl = `https://player.vimeo.com/video/${videoId}?${isAutoPlay ? 'autoplay=1&muted=1' : ''}`;
    } else {
        return (
            <video className="w-full h-full object-cover" controls autoPlay={isAutoPlay} muted={isAutoPlay}>
                <source src={url} />
                Your browser does not support the video tag.
            </video>
        );
    }

    return (
        <iframe
            className="w-full h-full"
            src={embedUrl}
            title={t("HtmlBuilder.VideoPlayer")}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
        />
    );
};


// ---------------------------------------------------------------------------
// CUSTOM GENERIC RENDERER (For user-created components)
// ---------------------------------------------------------------------------

export const GenericBlockRenderer: React.FC<BlockRendererProps> = ({ settings, content, htmlTemplate, apiConfig, onEditIcon }) => {
    const { t } = useTranslation();
    const [mergedContent, setMergedContent] = useState<Record<string, any>>({ ...content });
    const [isFetching, setIsFetching] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!apiConfig || !apiConfig.url || !apiConfig.autoFetch) return;

            setIsFetching(true);
            try {
                const res = await fetch(apiConfig.url, { method: apiConfig.method || 'GET' });
                const data = await res.json();

                // If dataKey is specified, use that part of the response, otherwise merge the whole object
                const dataToMerge = apiConfig.dataKey ? { [apiConfig.dataKey]: data } : data;

                setMergedContent(prev => ({
                    ...prev,
                    ...dataToMerge
                }));
            } catch (err) {
                console.error("Component API Fetch Error:", err);
            } finally {
                setIsFetching(false);
            }
        };

        fetchData();
    }, [apiConfig]);

    // Update merged content when props change (e.g. user typing in editor)
    useEffect(() => {
        setMergedContent(prev => ({ ...prev, ...content }));
    }, [content]);

    if (!htmlTemplate) return <div className="p-4 bg-red-50 text-red-500">{t("HtmlBuilder.MissingTemplate")}</div>;

    // --- Simple Templating Engine ---

    let renderedHtml = htmlTemplate;

    // 0. Map background settings to actual CSS classes (before any replacement)
    const processedSettings = { ...settings };
    if (processedSettings['Background']) {
        const bgMapping: Record<string, string> = {
            'layout--background-main': 'bg-white',
            'layout--background-alt': 'bg-gray-50',
            'layout--background-dark': 'bg-slate-900 text-white',
            'layout--background-accent': 'bg-blue-50'
        };
        processedSettings['Background'] = bgMapping[processedSettings['Background']] || processedSettings['Background'];
    }

    // 1. Handle Conditionals: {{#if content.key}} ... {{else}} ... {{/if}} or {{#if settings.key}}
    const conditionalRegex = /\{\{#if\s+(content|settings)\.([a-zA-Z0-9_]+)\}\}(.*?)(?:\{\{else\}\}(.*?))?\{\{\/if\}\}/gs;

    renderedHtml = renderedHtml.replace(conditionalRegex, (match, source, key, ifBlock, elseBlock = '') => {
        const sourceData = source === 'content' ? mergedContent : processedSettings;
        const value = sourceData[key];

        // Check if value is truthy (exists and not empty string)
        const isTruthy = value && value !== 'false' && value !== '0';
        return isTruthy ? ifBlock : elseBlock;
    });

    // 2. Handle Loops: {{#each content.listKey}} ... {{/each}}
    const loopRegex = /\{\{#each\s+content\.([a-zA-Z0-9_]+)\}\}(.*?)\{\{\/each\}\}/gs;

    renderedHtml = renderedHtml.replace(loopRegex, (match, key, innerTemplate) => {
        let listData = mergedContent[key];

        // If it's a string (from local storage JSON), parse it
        if (typeof listData === 'string') {
            try { listData = JSON.parse(listData); } catch (e) { listData = []; }
        }

        if (!Array.isArray(listData)) return '';

        return listData.map((item: any) => {
            let itemHtml = innerTemplate;
            // Replace keys inside the loop (e.g., {{title}})
            Object.keys(item).forEach(itemKey => {
                const itemRegex = new RegExp(`\{\{${itemKey}\}\}`, 'g');
                itemHtml = itemHtml.replace(itemRegex, item[itemKey] || '');
            });
            return itemHtml;
        }).join('');
    });

    // 3. Replace Settings (use processed settings with mapped background)
    Object.keys(processedSettings).forEach(key => {
        const regex = new RegExp(`\{\{settings\.${key}\}\}`, 'g');
        renderedHtml = renderedHtml.replace(regex, processedSettings[key] || '');
    });

    // 4. Replace Content (Top level)
    Object.keys(mergedContent).forEach(key => {
        // Skip objects/arrays, only stringify primitives
        const val = mergedContent[key];
        if (typeof val === 'string' || typeof val === 'number') {
            const regex = new RegExp(`\{\{content\.${key}\}\}`, 'g');
            renderedHtml = renderedHtml.replace(regex, String(val));
        }
    });

    // 5. Cleanup unused placeholders
    renderedHtml = renderedHtml.replace(/\{\{settings\.[^}]+\}\}/g, '');
    renderedHtml = renderedHtml.replace(/\{\{content\.[^}]+\}\}/g, '');
    renderedHtml = renderedHtml.replace(/\{\{#each\s+.*?\}\}.*?\{\{\/each\}\}/gs, ''); // Remove broken loops
    renderedHtml = renderedHtml.replace(/\{\{#if\s+.*?\}\}.*?\{\{\/if\}\}/gs, ''); // Remove broken conditionals

    // 6. Post-process: Inject icons after render and add click handlers
    useEffect(() => {
        if (!containerRef.current) return;

        // Find all elements with data-icon attribute and inject Lucide icons
        const iconPlaceholders = containerRef.current.querySelectorAll('[data-icon]');

        // Store cleanup functions for event listeners and React roots
        const cleanupFunctions: (() => void)[] = [];
        const reactRoots: any[] = [];

        iconPlaceholders.forEach((el) => {
            const iconName = el.getAttribute('data-icon');
            const iconKey = el.getAttribute('data-icon-key'); // For identifying which content field

            if (iconName) {
                // Clear existing content
                el.innerHTML = '';

                // Get the icon component from Lucide
                const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;
                const iconSize = parseInt(el.getAttribute('data-icon-size') || '24');

                // Create a wrapper for the icon
                const iconWrapper = document.createElement('span');
                iconWrapper.style.display = 'inline-flex';
                iconWrapper.style.alignItems = 'center';
                iconWrapper.style.justifyContent = 'center';
                iconWrapper.style.flexShrink = '0'; // Prevent shrinking
                iconWrapper.style.width = `${iconSize}px`;
                iconWrapper.style.height = `${iconSize}px`;

                // Create container for React component
                const tempContainer = document.createElement('div');
                tempContainer.style.display = 'flex';
                tempContainer.style.alignItems = 'center';
                tempContainer.style.justifyContent = 'center';
                tempContainer.style.width = '100%';
                tempContainer.style.height = '100%';
                iconWrapper.appendChild(tempContainer);
                el.appendChild(iconWrapper);

                // Render the actual Lucide icon using createRoot (React 18)
                const root = createRoot(tempContainer);
                reactRoots.push(root);
                root.render(
                    <DynamicIcon
                        name={iconName}
                        size={iconSize}
                        className={onEditIcon && iconKey ? 'cursor-pointer' : ''}
                    />
                );

                // Add click handler for icon picker
                if (onEditIcon && iconKey) {
                    const htmlEl = el as HTMLElement;
                    htmlEl.style.cursor = 'pointer';
                    htmlEl.style.pointerEvents = 'auto';

                    const clickHandler = (e: Event) => {
                        e.stopPropagation();
                        onEditIcon(iconKey);
                    };

                    el.addEventListener('click', clickHandler);

                    // Add cleanup function
                    cleanupFunctions.push(() => {
                        el.removeEventListener('click', clickHandler);
                    });
                }
            }
        });

        // --- Video Player Injection ---
        const videoPlaceholders = containerRef.current.querySelectorAll('[data-video]');
        videoPlaceholders.forEach((el) => {
            const videoUrl = el.getAttribute('data-video');
            const autoPlay = el.getAttribute('data-video-autoplay') || 'false';

            if (videoUrl) {
                el.innerHTML = '';
                const tempContainer = document.createElement('div');
                tempContainer.className = 'w-full h-full';
                el.appendChild(tempContainer);

                const root = createRoot(tempContainer);
                reactRoots.push(root);
                root.render(<VideoPlayer url={videoUrl} autoPlay={autoPlay} />);
            }
        });

        // --- Tabs Interactivity ---
        const tabContainers = containerRef.current.querySelectorAll('.builder-tabs');
        tabContainers.forEach((tabsEl) => {
            const buttons = tabsEl.querySelectorAll('button');
            const contentEl = (tabsEl.parentElement as HTMLElement)?.querySelector('.builder-tab-content');

            if (buttons.length > 0 && contentEl && mergedContent.tabs) {
                let tabsData: any[] = [];
                try {
                    tabsData = typeof mergedContent.tabs === 'string'
                        ? JSON.parse(mergedContent.tabs)
                        : mergedContent.tabs;
                } catch (e) {
                    console.error("Failed to parse tabs data", e);
                }

                const switchTab = (index: number) => {
                    buttons.forEach((btn, i) => {
                        if (i === index) {
                            btn.classList.add('border-blue-600', 'text-blue-600');
                            btn.classList.remove('border-transparent', 'text-gray-500');
                        } else {
                            btn.classList.remove('border-blue-600', 'text-blue-600');
                            btn.classList.add('border-transparent', 'text-gray-500');
                        }
                    });

                    if (tabsData[index]) {
                        contentEl.innerHTML = tabsData[index].content || '';
                    }
                };

                buttons.forEach((btn, index) => {
                    const clickHandler = (e: Event) => {
                        e.stopPropagation();
                        switchTab(index);
                    };
                    btn.addEventListener('click', clickHandler);
                    cleanupFunctions.push(() => btn.removeEventListener('click', clickHandler));
                });

                // Initialize first tab
                switchTab(0);
            }
        });

        // --- Accordion Interactivity ---
        const accordions = containerRef.current.querySelectorAll('.builder-accordion');
        accordions.forEach((accEl) => {
            const items = accEl.querySelectorAll('.accordion-item');

            items.forEach((item) => {
                const trigger = item.querySelector('.accordion-trigger');
                const content = item.querySelector('.accordion-content');
                const icon = item.querySelector('.accordion-icon');

                if (trigger && content) {
                    const clickHandler = (e: Event) => {
                        e.stopPropagation();
                        const isHidden = content.classList.contains('hidden');

                        // Close others could be added here if desired

                        if (isHidden) {
                            content.classList.remove('hidden');
                            if (icon) icon.classList.add('rotate-180');
                        } else {
                            content.classList.add('hidden');
                            if (icon) icon.classList.remove('rotate-180');
                        }
                    };

                    trigger.addEventListener('click', clickHandler);
                    cleanupFunctions.push(() => trigger.removeEventListener('click', clickHandler));
                }
            });
        });

        // Return a cleanup function for the entire effect
        return () => {
            cleanupFunctions.forEach(cleanup => cleanup());
            // Unmount all React roots (defer to avoid race conditions)
            reactRoots.forEach(root => {
                setTimeout(() => {
                    try {
                        root.unmount();
                    } catch (e) {
                        // Ignore errors during unmount
                    }
                }, 0);
            });
        };
    }, [renderedHtml, onEditIcon, mergedContent]); // Add mergedContent to dependencies so icons update

    return (
        <div className="relative" ref={containerRef}>
            {isFetching && (
                <div className="absolute top-2 right-2 z-10">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping absolute inline-flex"></span>
                </div>
            )}
            <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
        </div>
    );
};


// ---------------------------------------------------------------------------
// EXISTING COMPONENTS
// ---------------------------------------------------------------------------

// export const TwoColBoxView: React.FC<BlockRendererProps> = ({ settings, content, onEditIcon }) => {
//     const alignClass = getAlignClass(settings['HeadingAlignment']);
//     const paddingClass = getPaddingClass(settings['SectionPadding']);
//     const bgClass = getBgClass(settings['Background']);
//     const hasBorder = settings['ShowBorder'] === 'true' ? 'border border-gray-200' : '';
//     const hasShadow = settings['ShowShadow'] === 'true' ? 'shadow-lg' : '';

//     return (
//         <div className={`${paddingClass} ${bgClass} ${hasBorder} ${hasShadow} transition-all duration-200`}>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
//                 <div className="order-last md:order-first overflow-hidden rounded-lg bg-gray-200 h-64 relative group">
//                     {content.imageUrl ? (
//                         <img src={content.imageUrl} alt="Content" className="w-full h-full object-cover" />
//                     ) : (
//                         <div className="flex items-center justify-center h-full text-gray-400"><DynamicIcon name="Image" size={48} /></div>
//                     )}
//                 </div>
//                 <div className={alignClass}>
//                     {content.icon && (
//                         <div
//                             className={`mb-4 inline-block p-3 rounded-full bg-blue-100 text-blue-600 cursor-pointer pointer-events-auto`}
//                             onClick={(e) => { e.stopPropagation(); if (onEditIcon) onEditIcon('icon'); }}
//                         >
//                             <DynamicIcon name={content.icon} size={24} />
//                         </div>
//                     )}
//                     <h2 className="text-3xl font-bold mb-4">{content.title}</h2>
//                     <p className="opacity-80 leading-relaxed mb-6">{content.body}</p>
//                     {content.ctaText && (
//                         <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">{content.ctaText}</button>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export const HeroView: React.FC<BlockRendererProps> = ({ settings, content }) => {
//     const heightClass = settings['Height'] === 'full' ? 'min-h-[80vh]' : 'min-h-[400px]';
//     const alignClass = getAlignClass(settings['Alignment']);
//     return (
//         <div className={`relative flex items-center ${heightClass} ${alignClass} bg-slate-900 text-white overflow-hidden`}>
//             <div className="absolute inset-0 z-0">
//                 {content.backgroundImage ? (
//                     <img src={content.backgroundImage} className="w-full h-full object-cover opacity-40" alt="Hero" />
//                 ) : (
//                     <div className="w-full h-full bg-gradient-to-r from-blue-900 to-slate-900 opacity-90" />
//                 )}
//             </div>
//             <div className="relative z-10 container mx-auto px-6">
//                 <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">{content.headline}</h1>
//                 <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto mb-8">{content.subheadline}</p>
//                 <button className="px-8 py-3 bg-white text-slate-900 font-bold rounded hover:bg-gray-100">Get Started</button>
//             </div>
//         </div>
//     );
// };

// export const TextBlockView: React.FC<BlockRendererProps> = ({ settings, content }) => {
//     const padding = getPaddingClass(settings['Padding']);
//     const align = getAlignClass(settings['Alignment']);
//     const bg = getBgClass(settings['Background']);
//     return (
//         <div className={`${padding} ${align} ${bg}`}>
//             <div className="max-w-4xl mx-auto">
//                 {content.heading && <h3 className="text-2xl font-semibold mb-3 text-current">{content.heading}</h3>}
//                 {/* Render HTML content securely */}
//                 <div
//                     className="prose max-w-none text-current opacity-80"
//                     dangerouslySetInnerHTML={{ __html: content.text || '' }}
//                 />
//             </div>
//         </div>
//     );
// };

// export const BlockQuoteView: React.FC<BlockRendererProps> = ({ settings, content }) => {
//     const padding = getPaddingClass(settings['Padding']);
//     const align = getAlignClass(settings['Alignment']);
//     const bg = getBgClass(settings['Background']);
//     const style = settings['Style'] || 'modern';

//     return (
//         <div className={`${padding} ${bg}`}>
//             <div className={`max-w-4xl mx-auto ${align}`}>
//                 {style === 'modern' ? (
//                     <blockquote className="border-l-4 border-blue-500 pl-4 italic text-xl text-gray-700">
//                         "{content.quote}"
//                         <footer className="mt-4 text-sm font-semibold text-gray-900 not-italic">— {content.author}, <span className="text-gray-500">{content.role}</span></footer>
//                     </blockquote>
//                 ) : (
//                     <div className="text-center">
//                         <LucideIcons.Quote size={40} className="mx-auto mb-4 text-blue-200" />
//                         <p className="text-2xl font-serif italic text-gray-800 mb-6">"{content.quote}"</p>
//                         <div className="font-bold text-gray-900">{content.author}</div>
//                         <div className="text-sm text-gray-500">{content.role}</div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export const SimpleBoxView: React.FC<BlockRendererProps> = ({ settings, content }) => {
//     const padding = getPaddingClass(settings['Padding']);
//     const bg = getBgClass(settings['Background']);
//     const radius = settings['Rounded'] === 'true' ? 'rounded-xl' : 'rounded-none';
//     const border = settings['Border'] === 'true' ? 'border border-gray-200' : '';

//     return (
//         <div className="p-8">
//             <div className={`${padding} ${bg} ${radius} ${border} shadow-sm`}>
//                 <h3 className="text-xl font-bold mb-2">{content.title}</h3>
//                 <p className="text-gray-600">{content.description}</p>
//             </div>
//         </div>
//     );
// };

// export const FeatureCardView: React.FC<BlockRendererProps> = ({ settings, content, onEditIcon }) => {
//     const align = getAlignClass(settings['Alignment']);
//     const bg = getBgClass(settings['Background']);

//     return (
//         <div className="p-4 md:p-8">
//             <div className={`h-full ${bg} p-6 rounded-xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow ${align}`}>
//                 <div
//                     className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-lg mb-4 cursor-pointer pointer-events-auto"
//                     onClick={(e) => { e.stopPropagation(); if (onEditIcon) onEditIcon('icon'); }}
//                 >
//                     <DynamicIcon name={content.icon || 'Star'} size={24} />
//                 </div>
//                 <h3 className="text-lg font-bold mb-2 text-gray-800">{content.title}</h3>
//                 <p className="text-gray-600 mb-4 text-sm leading-relaxed">{content.description}</p>
//                 {content.linkText && (
//                     <a href="#" className="text-blue-600 font-medium text-sm hover:underline inline-flex items-center gap-1">
//                         {content.linkText} <LucideIcons.ArrowRight size={14} />
//                     </a>
//                 )}
//             </div>
//         </div>
//     );
// };

// export const TabsView: React.FC<BlockRendererProps> = ({ settings, content }) => {
//     const [activeTab, setActiveTab] = useState(0);
//     const padding = getPaddingClass(settings['Padding']);

//     let tabs = [];
//     try {
//         tabs = JSON.parse(content.tabs || '[]');
//     } catch (e) { tabs = []; }

//     // If no tabs, show a placeholder so it's not empty
//     if (tabs.length === 0) {
//         tabs = [{ title: "Sample Tab", content: "Add content in settings." }];
//     }

//     return (
//         <div className={`${padding} bg-white`}>
//             <div className="max-w-4xl mx-auto">
//                 <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
//                     {tabs.map((tab: any, idx: number) => (
//                         <button
//                             key={idx}
//                             onClick={(e) => { e.stopPropagation(); setActiveTab(idx); }}
//                             className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 pointer-events-auto whitespace-nowrap ${activeTab === idx
//                                 ? 'border-blue-600 text-blue-600'
//                                 : 'border-transparent text-gray-500 hover:text-gray-700'
//                                 }`}
//                         >
//                             {tab.title}
//                         </button>
//                     ))}
//                 </div>
//                 <div
//                     className="min-h-[100px] text-gray-700 leading-relaxed bg-gray-50 p-6 rounded-lg prose max-w-none"
//                     dangerouslySetInnerHTML={{ __html: tabs[activeTab]?.content || '' }}
//                 />
//             </div>
//         </div>
//     );
// };

// export const AccordionView: React.FC<BlockRendererProps> = ({ settings, content }) => {
//     const [openIndex, setOpenIndex] = useState<number | null>(0);
//     const padding = getPaddingClass(settings['Padding']);

//     let items = [];
//     try {
//         items = JSON.parse(content.items || '[]');
//     } catch (e) { items = []; }

//     return (
//         <div className={`${padding} bg-white`}>
//             <div className="max-w-3xl mx-auto space-y-2">
//                 {items.map((item: any, idx: number) => {
//                     const isOpen = openIndex === idx;
//                     return (
//                         <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
//                             <button
//                                 onClick={(e) => { e.stopPropagation(); setOpenIndex(isOpen ? null : idx); }}
//                                 className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition text-left font-medium text-gray-800 pointer-events-auto"
//                             >
//                                 {item.title}
//                                 <LucideIcons.ChevronDown size={18} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
//                             </button>
//                             {isOpen && (
//                                 <div
//                                     className="p-4 bg-white text-gray-600 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200 prose max-w-none"
//                                     dangerouslySetInnerHTML={{ __html: item.body || '' }}
//                                 />
//                             )}
//                         </div>
//                     );
//                 })}
//                 {items.length === 0 && <div className="p-4 text-gray-400 italic text-center">Configure accordion items in the settings panel.</div>}
//             </div>
//         </div>
//     );
// };

// export const TitleView: React.FC<BlockRendererProps> = ({ settings, content }) => {
//     const align = getAlignClass(settings['Alignment']);
//     const size = settings['Size'] === 'h1' ? 'text-4xl md:text-5xl' : settings['Size'] === 'h3' ? 'text-xl' : 'text-3xl';

//     return (
//         <div className={`${getPaddingClass(settings['Padding'])} ${align}`}>
//             <h2 className={`${size} font-bold text-gray-900 mb-2`}>{content.title}</h2>
//             {content.subtitle && <p className="text-xl text-gray-500 max-w-2xl mx-auto">{content.subtitle}</p>}
//             {content.divider === 'true' && <div className={`h-1 w-20 bg-blue-500 mt-4 rounded ${align.includes('center') ? 'mx-auto' : ''}`} />}
//         </div>
//     );
// };

// export const MultiColTextView: React.FC<BlockRendererProps> = ({ settings, content }) => {
//     const cols = settings['Columns'] || '3';
//     const gridClass = cols === '2' ? 'grid-cols-1 md:grid-cols-2' : cols === '4' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-3';
//     const bg = getBgClass(settings['Background']);

//     return (
//         <div className={`${getPaddingClass(settings['Padding'])} ${bg}`}>
//             <div className={`grid ${gridClass} gap-8`}>
//                 {[1, 2, 3, 4].slice(0, parseInt(cols)).map(num => (
//                     <div key={num} className="space-y-3">
//                         <h3 className="text-lg font-bold text-gray-900">{content[`col${num}Title`]}</h3>
//                         <p className="text-gray-600 leading-relaxed text-sm">{content[`col${num}Text`]}</p>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export const VideoView: React.FC<BlockRendererProps> = ({ settings, content }) => {
//     const padding = getPaddingClass(settings['Padding']);
//     const maxWidth = settings['MaxWidth'] === 'small' ? 'max-w-2xl' : settings['MaxWidth'] === 'medium' ? 'max-w-4xl' : 'max-w-6xl';

//     return (
//         <div className={`${padding} bg-white flex justify-center`}>
//             <div className={`w-full ${maxWidth} aspect-video rounded-xl overflow-hidden shadow-2xl bg-black`}>
//                 <VideoPlayer url={content.videoUrl} autoPlay={settings['AutoPlay']} />
//             </div>
//         </div>
//     );
// };

// export const VideoFeatureView: React.FC<BlockRendererProps> = ({ settings, content }) => {
//     const reverse = settings['Layout'] === 'right';
//     const bg = getBgClass(settings['Background']);

//     return (
//         <div className={`${getPaddingClass(settings['Padding'])} ${bg}`}>
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
//                 <div className={`${reverse ? 'order-last lg:order-first' : ''}`}>
//                     <div className="aspect-video rounded-lg overflow-hidden shadow-lg bg-gray-800">
//                         <VideoPlayer url={content.videoUrl} />
//                     </div>
//                 </div>
//                 <div>
//                     <div className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-2">{content.kicker}</div>
//                     <h2 className="text-3xl font-bold mb-4 text-gray-900">{content.headline}</h2>
//                     <p className="text-gray-600 mb-6 leading-relaxed">{content.body}</p>
//                     <ul className="space-y-2 mb-8">
//                         {['Feature 1', 'Feature 2', 'Feature 3'].map((f, i) => (
//                             content[`feature${i + 1}`] ? (
//                                 <li key={i} className="flex items-center gap-2">
//                                     <LucideIcons.CheckCircle size={18} className="text-green-500" />
//                                     <span>{content[`feature${i + 1}`]}</span>
//                                 </li>
//                             ) : null
//                         ))}
//                     </ul>
//                     {content.ctaText && <button className="px-6 py-2.5 bg-gray-900 text-white rounded hover:bg-gray-800 transition">{content.ctaText}</button>}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export const FeatureGridView: React.FC<BlockRendererProps> = ({ settings, content, onEditIcon }) => {
//     const cols = settings['Columns'] || '3';
//     const gridClass = cols === '2' ? 'grid-cols-1 md:grid-cols-2' : cols === '4' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-3';

//     let features = [];
//     try {
//         features = JSON.parse(content.features || '[]');
//     } catch (e) { features = []; }

//     return (
//         <div className={`${getPaddingClass(settings['Padding'])} bg-white`}>
//             <div className="text-center mb-12 max-w-2xl mx-auto">
//                 <h2 className="text-3xl font-bold mb-4">{content.mainTitle}</h2>
//                 <p className="text-gray-600">{content.mainDesc}</p>
//             </div>
//             <div className={`grid ${gridClass} gap-8`}>
//                 {features.map((item: any, i: number) => {
//                     return (
//                         <div key={i} className="p-6 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition border border-transparent hover:border-gray-100">
//                             <div
//                                 className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 cursor-pointer pointer-events-auto"
//                             // Note: Icon picker for list items would need complex wiring for dynamic IDs
//                             // Currently unsupported for dynamic lists in this simple implementation
//                             >
//                                 <DynamicIcon name={item.icon || 'Check'} size={20} />
//                             </div>
//                             <h3 className="font-bold text-lg mb-2">{item.title}</h3>
//                             <p className="text-sm text-gray-500">{item.desc}</p>
//                         </div>
//                     );
//                 })}
//             </div>
//             {features.length === 0 && <div className="text-center text-gray-400">Add features in the settings panel.</div>}
//         </div>
//     );
// };

// export const BlogListView: React.FC<BlockRendererProps> = ({ settings, content }) => {
//     const count = parseInt(settings['PostCount'] || '3');

//     // Mock Data Generator
//     const posts = Array.from({ length: count }).map((_, i) => ({
//         id: i,
//         title: i === 0 ? "Getting Started with Web Development" : i === 1 ? "The Future of CSS" : "React vs Vue: A Comparison",
//         excerpt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
//         date: "Oct 24, 2023",
//         image: `https://picsum.photos/seed/${i + 10}/400/250`
//     }));

//     return (
//         <div className={`${getPaddingClass(settings['Padding'])} bg-white`}>
//             <div className="flex justify-between items-end mb-8">
//                 <div>
//                     <h2 className="text-3xl font-bold">{content.sectionTitle}</h2>
//                 </div>
//                 {content.showLink === 'true' && (
//                     <a href="#" className="text-blue-600 font-semibold hover:underline">View All Posts &rarr;</a>
//                 )}
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//                 {posts.map(post => (
//                     <article key={post.id} className="group cursor-pointer">
//                         <div className="rounded-xl overflow-hidden mb-4 relative aspect-[4/3]">
//                             <img src={post.image} alt="Blog" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
//                             <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition" />
//                         </div>
//                         <div className="text-xs text-blue-600 font-bold mb-2 uppercase tracking-wide">{post.date}</div>
//                         <h3 className="text-xl font-bold mb-2 group-hover:text-blue-700 transition">{post.title}</h3>
//                         <p className="text-gray-600 text-sm line-clamp-2">{post.excerpt}</p>
//                     </article>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export const COMPONENT_REGISTRY: Record<string, React.FC<BlockRendererProps>> = {
//     'HeroView': HeroView,
//     '2ColBoxView': TwoColBoxView,
//     'TextBlockView': TextBlockView,
//     'BlockQuoteView': BlockQuoteView,
//     'SimpleBoxView': SimpleBoxView,
//     'FeatureCardView': FeatureCardView,
//     'TabsView': TabsView,
//     'AccordionView': AccordionView,
//     'TitleView': TitleView,
//     'MultiColTextView': MultiColTextView,
//     'VideoView': VideoView,
//     'VideoFeatureView': VideoFeatureView,
//     'FeatureGridView': FeatureGridView,
//     'BlogListView': BlogListView,
// };

// export const COMPONENT_ICONS: Record<string, React.ElementType> = {
//     'HeroView': LucideIcons.LayoutTemplate,
//     '2ColBoxView': LucideIcons.Columns,
//     'TextBlockView': LucideIcons.Type,
//     'BlockQuoteView': LucideIcons.Quote,
//     'SimpleBoxView': LucideIcons.Square,
//     'FeatureCardView': LucideIcons.CreditCard,
//     'TabsView': LucideIcons.GalleryHorizontal,
//     'AccordionView': LucideIcons.ListCollapse,
//     'TitleView': LucideIcons.Heading,
//     'MultiColTextView': LucideIcons.LayoutList,
//     'VideoView': LucideIcons.Video,
//     'VideoFeatureView': LucideIcons.MonitorPlay,
//     'FeatureGridView': LucideIcons.Grid,
//     'BlogListView': LucideIcons.Newspaper,
// };
