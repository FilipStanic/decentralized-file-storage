import React from 'react';
import { FolderPlus, Upload } from 'lucide-react';
import { useMultiSelect } from '@/Pages/MultiSelectProvider.jsx';

const FolderViewToolbar = ({
    isSearching,
    currentFolder,
    searchTerm,
    totalResults,
    handleNewFolder,
    handleUpload
}) => {
    const {
        isSelectionMode,
        toggleSelectionMode
    } = useMultiSelect();

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
                <h1 className="text-xl sm:text-2xl font-semibold dark:text-white truncate">
                    {isSearching
                        ? `Search Results in ${currentFolder ? currentFolder.name : 'All Folders'}`
                        : (currentFolder ? currentFolder.name : 'Folders')}
                </h1>
                {isSearching && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Found {totalResults} {totalResults === 1 ? 'result' : 'results'} for "{searchTerm}"
                    </p>
                )}
            </div>

            <div className="flex items-center space-x-3 flex-shrink-0">
                {!isSelectionMode ? (
                    <button
                        onClick={toggleSelectionMode}
                        className="flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                        title="Enter selection mode"
                    >
                        <span>Select</span>
                    </button>
                ) : null}

                <button
                    onClick={handleUpload}
                    className="flex items-center justify-center gap-1 px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                >
                    <Upload size={16} className="hidden sm:block" />
                    <span>Upload</span>
                </button>

                <button
                    onClick={handleNewFolder}
                    className="flex items-center justify-center gap-1 px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                >
                    <FolderPlus size={16} className="hidden sm:block" />
                    <span>New Folder</span>
                </button>
            </div>
        </div>
    );
};

export default FolderViewToolbar;