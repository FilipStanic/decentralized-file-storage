import '../css/app.css';
import './bootstrap';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { SearchProvider } from './Pages/Context/SearchContext.jsx';
import { ThemeProvider } from './Pages/Context/ThemeContext.jsx';

const appName = import.meta.env.VITE_APP_NAME || 'BlockStore';

document.addEventListener('inertia:before', (event) => {
    const searchTerm = sessionStorage.getItem('currentSearch');
    if (searchTerm) {
        if (event.detail.visit.type === 'visit') {
            event.preventDefault();
        }
    }
});

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
                    <App {...props} />
                </SearchProvider>
            </ThemeProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
