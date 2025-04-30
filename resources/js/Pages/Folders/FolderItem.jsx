import React, { useState, useRef, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { router } from '@inertiajs/core';
import { FolderIcon, Star, Trash2, Pencil, MoreHorizontal, MoveIcon } from 'lucide-react';
import DeleteFolderModal from './DeleteFolderModal.jsx';
import axios from 'axios';
import { useMultiSelect } from '@/Pages/MultiSelectProvider.jsx';
import { useDragDrop } from '@/Pages/DragDropService.jsx';

const FolderItem = ({ folder, onRenameClick }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isStarred, setIsStarred] = useState(folder?.starred || false);
    const [deleting, setDeleting] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
    const [destinationFolders, setDestinationFolders] = useState([]);
    const [loadingDestinations, setLoadingDestinations] = useState(false);

    // Get multi-select functionality
    const {
        isSelectionMode,
        toggleFolderSelection,
        isFolderSelected
    } = useMultiSelect();

    // Get drag and drop functionality
    const {
        startDraggingFolder,
        handleDropInFolder,
        canDropIntoFolder,
        handleFolderDragOver,
        isDragging,
        draggedItem
    } = useDragDrop();

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                (!buttonRef.current || !buttonRef.current.contains(event.target))) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef, buttonRef]);

    // Check if this folder is selected
    const isSelected = isFolderSelected(folder.id);

    // Check if this folder can be a drop target while something is being dragged
    const isDropTarget = isDragging && canDropIntoFolder(folder);

    const handleToggleStar = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (deleting) return;
        setIsStarred(prev => !prev);
        axios.post(route('folders.toggle-star', folder.id))
            .then(response => {
                if (response.data && typeof response.data.starred !== 'undefined') {
                    setIsStarred(response.data.starred);
                }
            })
            .catch(error => {
                console.error('Error toggling star:', error);
                setIsStarred(folder.starred);
            });
    };

    const handleShowDeleteModal = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowDeleteModal(true);
    };

    const handleRename = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof onRenameClick === 'function') {
            onRenameClick(folder);
        }
    };

    const toggleDropdown = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // If opening the dropdown, load available folders
        if (!dropdownOpen) {
            setLoadingDestinations(true);
            axios.get(route('sidebar.available-folders', { current_folder_id: folder.id }))
                .then(response => {
                    setDestinationFolders(response.data.folders || []);
                    setLoadingDestinations(false);
                })
                .catch(error => {
                    console.error('Error fetching available folders:', error);
                    setLoadingDestinations(false);
                });
        }

        setDropdownOpen(!dropdownOpen);
    };

    const handleMoveFolder = (targetFolderId) => {
        setDropdownOpen(false);

        router.post(route('folders.move-folders', targetFolderId), {
            folder_ids: [folder.id]
        }, {
            preserveScroll: true,
            onSuccess: () => {
                // Refresh the page to show the updated folder structure
                router.reload({ only: ['folders'] });
            },
            onError: (errors) => {
                console.error('Error moving folder:', errors);
                alert(`Error moving folder: ${errors.message || 'Please try again'}`);
            }
        });
    };

    // Handle selection click
    const handleSelectionClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isSelectionMode) {
            toggleFolderSelection(folder);
        }
    };

    // Handle drag start
    const handleDragStart = (e) => {
        e.stopPropagation();
        if (isSelectionMode) return; // Don't start drag in selection mode

        startDraggingFolder(folder, e);
        e.dataTransfer.setData('text/plain', JSON.stringify({
            type: 'folder',
            id: folder.id
        }));
    };

    // Handle drag over
    const handleDragOver = (e) => {
        e.preventDefault();
        handleFolderDragOver(folder, e);
    };

    // Handle drop
    const handleDrop = (e) => {
        e.preventDefault();
        handleDropInFolder(folder.id, e);
    };

    return (
        <>
            <div
                className={`p-4 border ${isDropTarget ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'dark:border-gray-700'}
                           rounded-lg hover:shadow-md transition-shadow flex flex-col bg-white dark:bg-gray-800
                           ${isSelected ? 'ring-2 ring-indigo-500 dark:ring-indigo-400' : ''}`}
                onClick={isSelectionMode ? handleSelectionClick : undefined}
                draggable="true"
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <div className="flex items-start justify-between mb-3">
                    <Link href={route('folders.show', folder.id)} className="flex-1">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <FolderIcon size={24} style={{ color: folder.color || '#6366F1' }} />
                        </div>
                    </Link>
                    <div className="flex items-center space-x-0.5 relative">
                        <button
                            onClick={handleRename}
                            className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Rename Folder"
                        >
                            <Pencil size={18} />
                        </button>
                        <button
                            ref={buttonRef}
                            onClick={toggleDropdown}
                            className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="More options"
                        >
                            <MoreHorizontal size={18} />
                        </button>
                        {dropdownOpen && (
                            <div
                                ref={dropdownRef}
                                className="absolute top-8 right-0 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border dark:border-gray-700"
                            >
                                <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 font-medium border-b dark:border-gray-700">
                                    Move to folder
                                </div>

                                {loadingDestinations ? (
                                    <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                                ) : (
                                    <>
                                        {destinationFolders.map(destFolder => (
                                            <button
                                                key={destFolder.id}
                                                onClick={() => handleMoveFolder(destFolder.id)}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                {destFolder.full_path}
                                            </button>
                                        ))}

                                        {destinationFolders.length === 0 && (
                                            <div className="px-4 py-2 text-sm text-gray-500">No available folders to move to</div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                        <button
                            onClick={handleToggleStar}
                            className="text-gray-400 hover:text-yellow-400 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            title={isStarred ? "Unstar" : "Star"}
                        >
                            <Star
                                size={18}
                                fill={isStarred ? "currentColor" : "none"}
                                className={isStarred ? "text-yellow-400" : ""}
                            />
                        </button>
                        <button
                            onClick={handleShowDeleteModal}
                            className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Delete Folder"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
                <Link href={route('folders.show', folder.id)}>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1 truncate">{folder.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {folder.item_count} {folder.item_count === 1 ? 'item' : 'items'} • {folder.last_modified}
                    </p>
                </Link>
            </div>
            {showDeleteModal && (
                <DeleteFolderModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    folder={folder}
                    onDeleteStart={() => setDeleting(true)}
                    onDeleteComplete={() => setDeleting(false)}
                />
            )}
        </>
    );
};

export default FolderItem;
