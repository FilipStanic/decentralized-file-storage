import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import Sidebar from '@/Pages/Shared/Sidebar.jsx';
import Header from '@/Pages/Shared/Header.jsx';
import StarredItems from '@/Pages/Starred/StarredItems.jsx';
import { useSearch } from '@/Pages/Shared/SearchContext.jsx';

export default function Index({ auth, starredFiles, starredFolders }) {
    const isAuthenticated = auth && auth.user;
    const { searchTerm, isSearching } = useSearch();

    const [filteredFiles, setFilteredFiles] = useState(starredFiles);
    const [filteredFolders, setFilteredFolders] = useState(starredFolders);
    const [totalResults, setTotalResults] = useState(0);

    // Filter starred items based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredFiles(starredFiles);
            setFilteredFolders(starredFolders);
            setTotalResults(starredFiles.length + starredFolders.length);
            return;
        }

        const lowerCaseTerm = searchTerm.toLowerCase();

        const matchingFiles = starredFiles.filter(file =>
            file.name.toLowerCase().includes(lowerCaseTerm)
        );

        const matchingFolders = starredFolders.filter(folder =>
            folder.name.toLowerCase().includes(lowerCaseTerm)
        );

        setFilteredFiles(matchingFiles);
        setFilteredFolders(matchingFolders);
        setTotalResults(matchingFiles.length + matchingFolders.length);
    }, [searchTerm, starredFiles, starredFolders]);

    return (
        <>
            <Head title="Starred Items" />

            <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                <Sidebar expanded={true} onCreateNew={() => {}} />

                <div className="flex-1 p-4 overflow-auto bg-gray-50 dark:bg-gray-900">
                    <Header
                        isAuthenticated={isAuthenticated}
                        auth={auth}
                        onUserDropdownToggle={() => {}}
                    />

                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                            {isSearching ? 'Search Results in Starred Items' : 'Starred Items'}
                        </h1>

                        {isSearching ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Found {totalResults} {totalResults === 1 ? 'result' : 'results'} for "{searchTerm}"
                            </p>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Your favorite files and folders in one place
                            </p>
                        )}
                    </div>

                    {(filteredFolders.length > 0 || !isSearching) && (
                        <StarredItems items={filteredFolders} type="folders" />
                    )}

                    <StarredItems items={filteredFiles} type="files" />
                </div>
            </div>
        </>
    );
}
