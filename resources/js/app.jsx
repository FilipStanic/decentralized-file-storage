import '../css/app.css';
import './bootstrap';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { SearchProvider } from './Pages/Context/SearchContext.jsx';

const appName = import.meta.env.VITE_APP_NAME || 'BlockStore';

// This fixes Inertia's default behavior of triggering full page reloads
// that would clear our search state
document.addEventListener('inertia:before', (event) => {
    // Check if a search is active in session storage
    const searchTerm = sessionStorage.getItem('currentSearch');
    if (searchTerm) {
        // We want to preserve the search when navigating
        // This ensures the user stays on their current page
        if (event.detail.visit.type === 'visit') {
            // Only for regular visits, not form submissions
            event.preventDefault();
        }
    }
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(
        `./Pages/${name}.jsx`,
        import.meta.glob('./Pages/**/*.jsx'),
    ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <SearchProvider>
                <App {...props} />
            </SearchProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
