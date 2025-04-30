import React from 'react';
import { X, Check, Trash2, FolderTransfer } from 'lucide-react';
import { useMultiSelect } from '@/Pages/MultiSelectProvider.jsx';

const SelectionBar = ({
                          onSelectAll,
                          onDeleteSelected,
                          filteredFiles,
                          filteredFolders
                      }) => {
    const {
        getSelectionCount,
        clearSelection,
        toggleSelectionMode,
        selectAllFiles,
        selectAllFolders
    } = useMultiSelect();

    const totalSelectionCount = getSelectionCount();

    const handleSelectAll = () => {
        if (filteredFiles && filteredFolders) {
            selectAllFiles(filteredFiles);
            selectAllFolders(filteredFolders);
        }
    };

    // Handle exit selection mode
    const handleExitSelection = () => {
        clearSelection();
        toggleSelectionMode();
    };

    return (
        <div className="sticky top-0 z-10 mb-4 p-3 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium dark:text-white">
                            {totalSelectionCount} {totalSelectionCount === 1 ? 'item' : 'items'} selected
                        </span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={clearSelection}
                            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                        >
                            Clear
                        </button>

                        <button
                            onClick={handleSelectAll}
                            className="text-xs text-gray-700 dark:text-gray-300 hover:text-indigo-700 dark:hover:text-indigo-300 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 flex items-center"
                        >
                            <Check size={14} className="mr-1" />
                            Select all visible
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Delete button for bulk deletion */}
                    <button
                        onClick={onDeleteSelected}
                        className="px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800/50 flex items-center gap-1"
                    >
                        <Trash2 size={16} />
                        <span className="hidden sm:inline">Delete</span>
                    </button>

                    {/* Exit selection mode button */}
                    <button
                        onClick={handleExitSelection}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm flex items-center gap-1"
                    >
                        <X size={16} />
                        <span>Exit selection</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SelectionBar;
