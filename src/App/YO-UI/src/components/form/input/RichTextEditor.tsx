// import React from "react";


// interface RichTextEditorProps {
//     id?: string;
//     labelName?: string;
//     value: string;
//     onChange: (value: string) => void;
//     placeholder?: string;
//     error?: boolean;
//     errorMsg?: string;
//     disabled?: boolean;
//     className?: string;
//     required?: boolean;
// }

// const RichTextEditor: React.FC<RichTextEditorProps> = ({
//     id,
//     labelName,
//     value,
//     onChange,
//     placeholder,
//     error = false,
//     errorMsg,
//     disabled = false,
//     className = "",
//     required = false,
// }) => {
//     const [editorState, setEditorState] = React.useState(() => {
//         if (value) {
//             const contentBlock = htmlToDraft(value);
//             if (contentBlock) {
//                 const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
//                 return EditorState.createWithContent(contentState);
//             }
//         }
//         return EditorState.createEmpty();
//     });

//     React.useEffect(() => {
//         if (value) {
//             const contentBlock = htmlToDraft(value);
//             if (contentBlock) {
//                 const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
//                 const newEditorState = EditorState.createWithContent(contentState);
//                 setEditorState(newEditorState);
//             }
//         } else {
//             setEditorState(EditorState.createEmpty());
//         }
//     }, [value]);

//     const onEditorStateChange = (newEditorState: EditorState) => {
//         setEditorState(newEditorState);
//         const html = draftToHtml(convertToRaw(newEditorState.getCurrentContent()));
//         onChange(html);
//     };

//     const toolbar = {
//         options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'link', 'image', 'history'],
//         inline: {
//             options: ['bold', 'italic', 'underline', 'strikethrough'],
//         },
//         blockType: {
//             inDropdown: true,
//             options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'],
//         },
//         list: {
//             options: ['unordered', 'ordered'],
//         },
//         textAlign: {
//             options: ['left', 'center', 'right', 'justify'],
//         },
//         link: {
//             options: ['link'],
//         },
//         image: {
//             uploadEnabled: true,
//             previewImage: true,
//             alt: { present: true, mandatory: false },
//         },
//     };

//     return (
//         <div className={`${className}`}>
//             {labelName && (
//                 <label
//                     htmlFor={id}
//                     className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300"
//                 >
//                     {labelName}
//                     {required && <span className="text-red-500 ml-1">*</span>}
//                 </label>
//             )}
//             <div
//                 className={`
//                     ${error ? "border-red-500" : "border-gray-300 dark:border-gray-700"}
//                     ${disabled ? "opacity-50 cursor-not-allowed" : ""}
//                     rounded-lg border bg-white dark:bg-gray-900
//                 `}
//             >
//                 <Editor
//                     editorState={editorState}
//                     onEditorStateChange={onEditorStateChange}
//                     toolbar={toolbar}
//                     placeholder={placeholder}
//                     readOnly={disabled}
//                     editorClassName="px-4 py-2 min-h-[200px] text-gray-900 dark:text-gray-100"
//                     toolbarClassName="border-b border-gray-300 dark:border-gray-700"
//                 />
//             </div>
//             {error && errorMsg && (
//                 <p className="mt-1 text-sm text-red-500">{errorMsg}</p>
//             )}
//             <style>{`
//                 .rdw-editor-toolbar {
//                     background: #f9fafb;
//                     border: none;
//                     border-bottom: 1px solid #e5e7eb;
//                     padding: 8px;
//                     border-radius: 0.5rem 0.5rem 0 0;
//                 }
//                 .dark .rdw-editor-toolbar {
//                     background: #1f2937;
//                     border-bottom-color: #374151;
//                 }
//                 .rdw-editor-main {
//                     min-height: 200px;
//                     font-size: 0.875rem;
//                 }
//                 .rdw-option-wrapper {
//                     border: 1px solid #e5e7eb;
//                     min-width: 25px;
//                     height: 25px;
//                     background: white;
//                 }
//                 .dark .rdw-option-wrapper {
//                     border-color: #4b5563;
//                     background: #374151;
//                     color: #d1d5db;
//                 }
//                 .rdw-option-wrapper:hover {
//                     box-shadow: 1px 1px 0px #bfbdbd;
//                     background: #f3f4f6;
//                 }
//                 .dark .rdw-option-wrapper:hover {
//                     background: #4b5563;
//                     box-shadow: 1px 1px 0px #6b7280;
//                 }
//                 .rdw-option-active {
//                     background: #e5e7eb;
//                     box-shadow: 1px 1px 0px #bfbdbd inset;
//                 }
//                 .dark .rdw-option-active {
//                     background: #4b5563;
//                 }
//                 .rdw-dropdown-wrapper {
//                     background: white;
//                     border: 1px solid #e5e7eb;
//                 }
//                 .dark .rdw-dropdown-wrapper {
//                     background: #374151;
//                     border-color: #4b5563;
//                     color: #d1d5db;
//                 }
//                 .rdw-dropdown-optionwrapper {
//                     background: white;
//                     border: 1px solid #e5e7eb;
//                 }
//                 .dark .rdw-dropdown-optionwrapper {
//                     background: #1f2937;
//                     border-color: #4b5563;
//                 }
//                 .rdw-dropdownoption-default {
//                     background: white;
//                 }
//                 .dark .rdw-dropdownoption-default {
//                     background: #1f2937;
//                     color: #d1d5db;
//                 }
//                 .rdw-dropdownoption-highlighted {
//                     background: #f3f4f6;
//                 }
//                 .dark .rdw-dropdownoption-highlighted {
//                     background: #374151;
//                 }
//                 .public-DraftEditorPlaceholder-root {
//                     color: #9ca3af;
//                 }
//             `}</style>
//         </div>
//     );
// };

// export default RichTextEditor;
