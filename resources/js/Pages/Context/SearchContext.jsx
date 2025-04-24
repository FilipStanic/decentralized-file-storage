import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';


const SearchContext = createContext();


export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
};


export const SearchProvider = ({ children }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    
    useEffect(() => {
        
        const handleBeforeUnload = () => {
            sessionStorage.removeItem('currentSearch');
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        
        const savedSearch = sessionStorage.getItem('currentSearch');
        if (savedSearch) {
            setSearchTerm(savedSearch);
            setIsSearching(!!savedSearch.trim());
        }

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    
    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
        setIsSearching(!!term.trim());

        
        
        if (term.trim()) {
            sessionStorage.setItem('currentSearch', term);
        } else {
            sessionStorage.removeItem('currentSearch');
        }

        
    }, []);

    
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
