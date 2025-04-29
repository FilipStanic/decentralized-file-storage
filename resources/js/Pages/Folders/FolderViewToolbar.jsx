import React from 'react';
import { CheckSquare, Square, Plus } from 'lucide-react';
import { useMultiSelect } from '@/Pages/MultiSelectProvider.jsx';

const FolderViewToolbar = ({
                               isSearching,
                               currentFolder,
                               searchTerm,
                               totalResults,
                               handleNewFolder
                           }) => {
    const { isSelectionMode, toggleSelectionMode } = useMultiSelect();

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
            <div className="flex items-center space-x-2 flex-shrink-0">
                {/* Selection mode toggle */}
                <button
                    onClick={toggleSelectionMode}
                    className={`flex items-center justify-center gap-1 px-3 py-1.5 ${
                        isSelectionMode
                            ? 'bg-indigo-600 text-white'
                            : 'border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                    } rounded-md hover:bg-opacity-90 text-sm`}
                    title={isSelectionMode ? "Exit selection mode" : "Enter selection mode"}
                >
                    {isSelectionMode ? (
                        <>
                            <CheckSquare size={16} />
                            <span>Exit selection</span>
                        </>
                    ) : (
                        <>
                            <Square size={16} />
                            <span>Select items</span>
                        </>
                    )}
                </button>

                <button
                    onClick={handleNewFolder}
                    className="flex items-center justify-center gap-1 px-3 sm:px-4 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                >
                    <Plus size={16} className="hidden sm:block" />
                    <span>New Folder</span>
                </button>
            </div>
        </div>
    );
};

export default FolderViewToolbar;
