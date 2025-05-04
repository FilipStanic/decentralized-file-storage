

import React, { useState, useRef, useEffect } from 'react';
import { X, Trash2, FolderPlus, CheckSquare } from 'lucide-react';
import { useMultiSelect } from '@/Pages/MultiSelectProvider.jsx';
import { router } from '@inertiajs/react';
import axios from 'axios';

const GlobalSelectionBar = ({ contextItems = [], currentFolderId = null }) => {
    const { 
        clearSelection, 
        getSelectionCount, 
        toggleSelectionMode,
        selectedItems,
        selectAllFiles
    } = useMultiSelect();
    
    const [showFolderDropdown, setShowFolderDropdown] = useState(false);
    const [availableFolders, setAvailableFolders] = useState([]);
    const [loadingFolders, setLoadingFolders] = useState(false);
    const dropdownRef = useRef(null);
    
    
    useEffect(() => {
        if (showFolderDropdown) {
            setLoadingFolders(true);
            axios.get(route('sidebar.available-folders', { current_folder_id: currentFolderId }))
                .then(response => {
                    setAvailableFolders(response.data.folders || []);
                    setLoadingFolders(false);
                })
                .catch(error => {
                    console.error('Error fetching available folders:', error);
                    setLoadingFolders(false);
                });
        }
    }, [showFolderDropdown, currentFolderId]);
    
    
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowFolderDropdown(false);
            }
        }
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);
    
    
    const handleSelectAll = () => {
        if (contextItems.files && contextItems.files.length > 0) {
            selectAllFiles(contextItems.files);
        }
        
        if (contextItems.folders && contextItems.folders.length > 0) {
            selectAllFolders(contextItems.folders);
        }
    };
    
    
    const handleBulkDelete = () => {
        if (getSelectionCount() === 0) return;
        
        if (!confirm(`Move ${getSelectionCount()} selected items to trash?`)) {
            return;
        }
        
        
        const deletedFileIds = [];
        const deletedFolderIds = [];
        
        
        const deleteFilesPromises = selectedItems.files.map(file => {
            return axios.delete(route('files.destroy', file.id))
                .then(() => {
                    deletedFileIds.push(file.id);
                })
                .catch(error => {
                    console.error('Error deleting file:', error);
                });
        });
        
        
        const deleteFoldersPromises = selectedItems.folders.map(folder => {
            return axios.delete(route('folders.destroy', folder.id))
                .then(() => {
                    deletedFolderIds.push(folder.id);
                })
                .catch(error => {
                    console.error('Error deleting folder:', error);
                });
        });
        
        
        Promise.all([...deleteFilesPromises, ...deleteFoldersPromises])
            .then(() => {
                
                deselectItems(deletedFileIds, deletedFolderIds);
                
                
                router.reload();
            });
    };
    
    
    const handleMoveToFolder = (folderId) => {
        setShowFolderDropdown(false);
        
        if (getSelectionCount() === 0) return;
        
        const movedFileIds = [];
        const movedFolderIds = [];
        let hasProcessed = false;
        
        
        if (selectedItems.files.length > 0) {
            const fileIds = selectedItems.files.map(file => file.id);
            
            if (folderId === null) {
                
                router.post(route('folders.move-files-to-root'), {
                    file_ids: fileIds
                }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        movedFileIds.push(...fileIds);
                        hasProcessed = true;
                        
                        if (hasProcessed && selectedItems.folders.length === 0) {
                            router.reload();
                        }
                    }
                });
            } else {
                
                router.post(route('folders.move-files', folderId), {
                    file_ids: fileIds
                }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        movedFileIds.push(...fileIds);
                        hasProcessed = true;
                        
                        if (hasProcessed && selectedItems.folders.length === 0) {
                            router.reload();
                        }
                    }
                });
            }
        }
        
        
        if (selectedItems.folders.length > 0) {
            const folderIds = selectedItems.folders.map(folder => folder.id);
            
            if (folderId === null) {
                
                router.post(route('folders.move-folders-to-root'), {
                    folder_ids: folderIds
                }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        movedFolderIds.push(...folderIds);
                        router.reload();
                    }
                });
            } else {
                
                router.post(route('folders.move-folders', folderId), {
                    folder_ids: folderIds
                }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        movedFolderIds.push(...folderIds);
                        router.reload();
                    }
                });
            }
        }
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
                        {getSelectionCount()} {getSelectionCount() === 1 ? 'item' : 'items'} selected
                    </span>
                    
                    <div className="flex gap-2">
                        <button
                            onClick={handleSelectAll}
                            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1"
                        >
                            <CheckSquare size={16} />
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
                    <div className="relative">
                        <button
                            onClick={() => setShowFolderDropdown(!showFolderDropdown)}
                            disabled={getSelectionCount() === 0}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FolderPlus size={16} />
                            <span>Move to</span>
                        </button>

                        {showFolderDropdown && (
                            <div
                                ref={dropdownRef}
                                className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 py-1 border dark:border-gray-700 max-h-60 overflow-y-auto"
                            >
                                <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 font-medium border-b dark:border-gray-700">
                                    Move selected items to
                                </div>

                                {loadingFolders ? (
                                    <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleMoveToFolder(null)}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            Root folder
                                        </button>

                                        {availableFolders.length > 0 && (
                                            <div className="border-t dark:border-gray-700 my-1"></div>
                                        )}

                                        {availableFolders.map(folder => (
                                            <button
                                                key={folder.id}
                                                onClick={() => handleMoveToFolder(folder.id)}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 truncate"
                                            >
                                                {folder.full_path || folder.name}
                                            </button>
                                        ))}

                                        {availableFolders.length === 0 && (
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
                        disabled={getSelectionCount() === 0}
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

export default GlobalSelectionBar;