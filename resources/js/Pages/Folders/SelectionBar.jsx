import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { useMultiSelect } from '@/Pages/MultiSelectProvider.jsx';

const SelectionBar = ({
    onDeleteSelected,
    filteredFiles = []
}) => {
    const {
        getSelectionCount,
        clearSelection,
        toggleSelectionMode,
        selectAllFiles
    } = useMultiSelect();

    const totalSelectionCount = getSelectionCount();
    
    const handleSelectAll = () => {
        selectAllFiles(filteredFiles);
    };
    
    const handleExitSelection = () => {
        clearSelection();
        toggleSelectionMode();
    };

    return (
        <div className="sticky top-0 z-10 mb-4 p-3 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-white mr-4">
                        {totalSelectionCount} {totalSelectionCount === 1 ? 'item' : 'items'} selected
                    </span>
                    
                    <div className="flex gap-2">
                        <button
                            onClick={handleSelectAll}
                            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            Select all
                        </button>
                        
                        <button
                            onClick={clearSelection}
                            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            Deselect all
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onDeleteSelected}
                        disabled={totalSelectionCount === 0}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Trash2 size={16} />
                        <span>Delete</span>
                    </button>

                    <button
                        onClick={handleExitSelection}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
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