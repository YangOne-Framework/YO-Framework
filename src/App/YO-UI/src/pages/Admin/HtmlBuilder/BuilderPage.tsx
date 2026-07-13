import React, { useState } from 'react';
import { Code, Layout, PenTool } from 'lucide-react';
import HtmlBuilder from '../../../components/htmlbuilder/Builder/HtmlBuilder';
import ComponentBuilder from '../../../components/htmlbuilder/Builder/ComponentBuilder';

type View = 'html-builder' | 'component-builder';

const BuilderPage: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>('html-builder');

    if (currentView === 'component-builder') {
        return <ComponentBuilder onBack={() => setCurrentView('html-builder')} />;
    }

    return (

        <HtmlBuilder />
    );
};

export default BuilderPage;