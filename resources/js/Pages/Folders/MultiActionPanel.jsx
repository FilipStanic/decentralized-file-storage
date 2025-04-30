import React from 'react';
import { Move, Trash2, CheckSquare } from 'lucide-react';
import { useMultiSelect } from '@/Pages/MultiSelectProvider.jsx';
import { useDragDrop } from '@/Pages/DragDropService.jsx';

const MultiActionPanel = ({
                              showBulkMoveDropdown,
                              setShowBulkMoveDropdown,
                              bulkActionDropdownRef,
                              destinationFolders,
                              loadingDestinations,
                              handleBulkMove,
                              handleBulkDelete,
                              filteredFiles,
                              filteredFolders
                          }) => {
    const { clearSelection, getSelectionCount, selectAllFiles, selectAllFolders } = useMultiSelect();
    const { startDraggingMultiple } = useDragDrop();

    // Handle drag start for multi-selected items
    const handleMultiDragStart = (e) => {
        e.preventDefault();
        const { selectedItems } = useMultiSelect();

        if (getSelectionCount() > 0) {
            startDraggingMultiple(selectedItems.files, selectedItems.folders, e);
        }
    };

    // Handle select all on current view - fixed to use filteredFiles and filteredFolders
    const handleSelectAll = () => {
        if (filteredFiles && filteredFolders) {
            selectAllFiles(filteredFiles);
            selectAllFolders(filteredFolders);
        }
    };

    return (
        <div className="sticky top-0 z-10 mb-4 p-3 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-md flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium dark:text-white">
                    {getSelectionCount()} {getSelectionCount() === 1 ? 'item' : 'items'} selected
                </span>
                <button
                    onClick={clearSelection}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                    Clear
                </button>
                {filteredFiles && filteredFolders && (
                    <button
                        onClick={handleSelectAll}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1"
                    >
                        <CheckSquare size={14} />
                        Select all visible
                    </button>
                )}
            </div>

            <div className="flex items-center gap-2">
                {/* Drag handle for multi-drag */}
                <div
                    className="p-2 text-gray-500 dark:text-gray-400 cursor-grab active:cursor-grabbing"
                    draggable="true"
                    onDragStart={handleMultiDragStart}
                    title="Drag selected items"
                >
                    <Move size={18} />
                </div>

                {/* Move button with dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowBulkMoveDropdown(!showBulkMoveDropdown)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="Move selected items"
                    >
                        <Move size={18} />
                    </button>

                    {showBulkMoveDropdown && (
                        <div
                            ref={bulkActionDropdownRef}
                            className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 py-1 border dark:border-gray-700 max-h-60 overflow-y-auto"
                        >
                            <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 font-medium border-b dark:border-gray-700">
                                Move selected items to
                            </div>

                            {loadingDestinations ? (
                                <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                            ) : (
                                <>
                                    {destinationFolders.map(folder => (
                                        <button
                                            key={folder.id}
                                            onClick={() => handleBulkMove(folder.id)}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            {folder.full_path}
                                        </button>
                                    ))}

                                    {destinationFolders.length === 0 && (
                                        <div className="px-4 py-2 text-sm text-gray-500">
                                            No available folders to move to
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Delete button for bulk deletion */}
                <button
                    onClick={handleBulkDelete}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    title="Move selected items to trash"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

export default MultiActionPanel;
