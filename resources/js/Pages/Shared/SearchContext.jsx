import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';

// Create the search context
const SearchContext = createContext();

// Custom hook to use the search context
export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
};

// Provider component
export const SearchProvider = ({ children }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Reset search on page refresh
    useEffect(() => {
        // This will clear the search when the page is refreshed
        const handleBeforeUnload = () => {
            sessionStorage.removeItem('currentSearch');
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        // Check if we have a saved search from before a page change
        const savedSearch = sessionStorage.getItem('currentSearch');
        if (savedSearch) {
            setSearchTerm(savedSearch);
            setIsSearching(!!savedSearch.trim());
        }

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    // Global search function that will work across pages
    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
        setIsSearching(!!term.trim());

        // Save search term to sessionStorage for persistence between page navigations
        // But not across page refreshes (which is handled by beforeunload event)
        if (term.trim()) {
            sessionStorage.setItem('currentSearch', term);
        } else {
            sessionStorage.removeItem('currentSearch');
        }

        // IMPORTANT: No redirect to home or any other page here
    }, []);

    // Clear search results
    const clearSearch = useCallback(() => {
        setSearchTerm('');
        setIsSearching(false);
        sessionStorage.removeItem('currentSearch');
    }, []);

    const value = {
        searchTerm,
        setSearchTerm,
        isSearching,
        handleSearch,
        clearSearch
    };

    return (
        <SearchContext.Provider value={value}>
            {children}
        </SearchContext.Provider>
    );
};

export default SearchContext;
