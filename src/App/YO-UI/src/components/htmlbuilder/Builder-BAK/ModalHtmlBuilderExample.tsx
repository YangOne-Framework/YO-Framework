import React, { useState } from 'react';
import ModalHtmlBuilder from './ModalHtmlBuilder';

/**
 * Usage Example for ModalHtmlBuilder
 * 
 * This example demonstrates how to integrate the ModalHtmlBuilder component
 * into any page for editing blog content, page content, or any HTML content.
 */

const ExampleUsage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContent, setEditingContent] = useState('');
    const [savedHtml, setSavedHtml] = useState('');

    // Example 1: Load plain HTML content
    const handleEditPlainHtml = () => {
        const plainHtml = `
      <div>
        <h1>Welcome to My Blog</h1>
        <p>This is a sample paragraph that can be edited inline.</p>
        <div>
          <h2>About Us</h2>
          <p>Click any text to edit it directly.</p>
        </div>
      </div>
    `;
        setEditingContent(plainHtml);
        setIsModalOpen(true);
    };

    // Example 2: Load component-based HTML
    const handleEditComponentHtml = () => {
        const componentHtml = `
      <div class="builder-component" data-template-name="HeroView" data-id="123" data-settings='{"Height":"auto","Alignment":"text-center"}' data-content='{"headline":"Welcome","subheadline":"Build amazing websites","backgroundImage":"https://picsum.photos/1200/800"}'>
        <!-- Component content here -->
      </div>
    `;
        setEditingContent(componentHtml);
        setIsModalOpen(true);
    };

    // Example 3: Load existing blog content
    const handleEditBlogContent = (blogContent: string) => {
        setEditingContent(blogContent);
        setIsModalOpen(true);
    };

    // Callback when user clicks "Done"
    const handleDone = (html: string) => {
        setSavedHtml(html);
        setIsModalOpen(false);

        // Here you would typically save the HTML to your backend
        // Example: await saveBlogContent(html);
        console.log('Edited HTML:', html);
    };

    // Callback when user closes modal
    const handleClose = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">ModalHtmlBuilder Example</h1>

            <div className="space-y-4">
                <button
                    onClick={handleEditPlainHtml}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Edit Plain HTML
                </button>

                <button
                    onClick={handleEditComponentHtml}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ml-4"
                >
                    Edit Component-based HTML
                </button>

                <button
                    onClick={() => handleEditBlogContent('<h1>My Blog Post</h1><p>Content here...</p>')}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 ml-4"
                >
                    Edit Blog Content
                </button>
            </div>

            {savedHtml && (
                <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4">Saved HTML:</h2>
                    <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                        {savedHtml}
                    </pre>
                </div>
            )}

            {/* The Modal HTML Builder */}
            <ModalHtmlBuilder
                isOpen={isModalOpen}
                initialContent={editingContent}
                onDone={handleDone}
                onClose={handleClose}
            />
        </div>
    );
};

export default ExampleUsage;

/**
 * INTEGRATION GUIDE:
 * 
 * 1. Import the component:
 *    import ModalHtmlBuilder from '../components/htmlbuilder/Builder/ModalHtmlBuilder';
 * 
 * 2. Add state to your component:
 *    const [isModalOpen, setIsModalOpen] = useState(false);
 *    const [htmlContent, setHtmlContent] = useState('');
 * 
 * 3. Add the modal to your JSX:
 *    <ModalHtmlBuilder
 *      isOpen={isModalOpen}
 *      initialContent={htmlContent}
 *      onDone={(html) => {
 *        // Save the edited HTML
 *        setYourContent(html);
 *        setIsModalOpen(false);
 *      }}
 *      onClose={() => setIsModalOpen(false)}
 *    />
 * 
 * 4. Open the modal with a button:
 *    <button onClick={() => {
 *      setHtmlContent(yourExistingContent);
 *      setIsModalOpen(true);
 *    }}>
 *      Edit HTML
 *    </button>
 * 
 * FEATURES:
 * - Automatically detects component-based vs plain HTML
 * - Plain HTML: Inline editing with contentEditable
 * - Component HTML: Full builder with drag-and-drop, settings panel
 * - Responsive preview (desktop, tablet, mobile)
 * - Clean HTML output without editor artifacts
 */
