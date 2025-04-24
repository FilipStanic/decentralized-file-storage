import React from 'react';
import { Search } from 'lucide-react';
import QuickAccessFiles from './QuickAccessFiles';
import RecentFiles from './RecentFiles';
import WelcomeSection from './WelcomeSection';
import HomePageHeaderActions from './HomePageHeaderActions';

export function AuthenticatedContentView({
                                             quickAccessFiles = [],
                                             recentFiles = [],
                                             searchTerm,
                                             showSearchResults,
                                             uniqueResultsCount,
                                             handleCreateNew,
                                             uploadFileData,
                                             dragActive,
                                             handleDrag,
                                             handleDrop,
                                             handleFileUpload,
                                             fileInputRef,
                                             handleUploadFromWelcome
                                         }) {

    const hasAnyFilesInitially = quickAccessFiles.length > 0 || recentFiles.length > 0;
    const isSearching = showSearchResults && searchTerm.trim();
    const noSearchResults = isSearching && uniqueResultsCount === 0;

    const showEmptyStateWelcome = !isSearching && !hasAnyFilesInitially;

    if (showEmptyStateWelcome) {
        return (
            <WelcomeSection
                isAuthenticated={true}
                file={uploadFileData}
                dragActive={dragActive}
                handleDrag={handleDrag}
                handleDrop={handleDrop}
                handleFileUpload={handleFileUpload}
                fileInputRef={fileInputRef}
                onUpload={handleUploadFromWelcome}
            />
        );
    }

    return (
        <>
            {isSearching && (
                <div className="mb-4">
                    <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                        Search results for "{searchTerm}"
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {uniqueResultsCount} {uniqueResultsCount === 1 ? 'result' : 'results'} found
                    </p>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 md:mb-0">
                    {isSearching ? 'Search Results' : 'My Files'}
                </h2>
                <HomePageHeaderActions onCreateNew={handleCreateNew} />
            </div>

            {noSearchResults ? (
                <div className="text-center py-10 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg">
                    <div className="inline-flex rounded-full bg-gray-100 dark:bg-gray-700 p-4 mb-4">
                        <Search size={24} className="text-gray-500 dark:text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No results found</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                        We couldn't find any files or folders matching "{searchTerm}".<br />
                        Try using different keywords or checking for typos.
                    </p>
                </div>
            ) : (
                <>
                    {(quickAccessFiles.length > 0 || !isSearching) && (
                        <QuickAccessFiles quickAccessFiles={quickAccessFiles} />
                    )}

                    {(recentFiles.length > 0 || !isSearching) && (
                        <RecentFiles recentFiles={recentFiles} />
                    )}
                </>
            )}
        </>
    );
}

export default AuthenticatedContentView;
