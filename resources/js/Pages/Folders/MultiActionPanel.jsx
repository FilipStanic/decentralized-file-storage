import React, { useEffect, useState } from 'react';
import { FolderUp, Trash2, CheckSquare } from 'lucide-react';
import { useMultiSelect } from '@/Pages/MultiSelectProvider.jsx';

const MultiActionPanel = ({
                              showBulkMoveDropdown,
                              setShowBulkMoveDropdown,
                              bulkActionDropdownRef,
                              destinationFolders: originalDestinationFolders,
                              loadingDestinations,
                              handleBulkMove,
                              handleBulkDelete,
                              filteredFiles
                          }) => {
    const { clearSelection, getSelectionCount, selectAllFiles } = useMultiSelect();
    
    const [destinationFolders, setDestinationFolders] = useState([]);

    
    useEffect(() => {
        if (originalDestinationFolders) {
            const filteredFolders = originalDestinationFolders.filter(folder =>
                folder.id !== null && folder.name !== 'Root'
            );
            setDestinationFolders(filteredFolders);
        }
    }, [originalDestinationFolders]);

    
    const handleSelectAllFiles = () => {
        if (filteredFiles) {
            selectAllFiles(filteredFiles);
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
                {filteredFiles && (
                    <button
                        onClick={handleSelectAllFiles}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1"
                    >
                        <CheckSquare size={14} />
                        Select all files
                    </button>
                )}
            </div>

            <div className="flex items-center gap-2">
                <div className="relative">
                    <button
                        onClick={() => setShowBulkMoveDropdown(!showBulkMoveDropdown)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="Move selected items"
                    >
                        <FolderUp size={18} />
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
                                    <button
                                        onClick={() => handleBulkMove(null)}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        Root
                                    </button>

                                    {destinationFolders.length > 0 && (
                                        <div className="border-t dark:border-gray-700 my-1"></div>
                                    )}

                                    {destinationFolders.map(folder => (
                                        <button
                                            key={folder.id}
                                            onClick={() => handleBulkMove(folder.id)}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            {folder.full_path}
                                        </button>
                                    ))}

                                    {destinationFolders.length === 0 && !(
                                        <div className="px-4 py-2 text-sm text-gray-500">
                                            No other folders available
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

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
