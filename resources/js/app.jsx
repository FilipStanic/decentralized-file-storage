import '../css/app.css';
import './bootstrap';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { SearchProvider } from './Pages/Context/SearchContext.jsx';
import { ThemeProvider } from './Pages/Context/ThemeContext.jsx';
import { MultiSelectProvider } from './Pages/MultiSelectProvider.jsx';
import { DragDropProvider } from './Pages/DragDropService.jsx';

const appName = import.meta.env.VITE_APP_NAME || 'BlockStore';

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) => resolvePageComponent(
        `./Pages/${name}.jsx`,
        import.meta.glob('./Pages/**/*.jsx'),
    ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <ThemeProvider>
                <SearchProvider>
                    <MultiSelectProvider>
                        <DragDropProvider>
                            <App {...props} />
                        </DragDropProvider>
                    </MultiSelectProvider>
                </SearchProvider>
            </ThemeProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
