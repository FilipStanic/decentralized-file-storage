import React, { useState, useRef, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { router } from '@inertiajs/core';
import { FolderIcon, Star, Trash2, Pencil, MoreHorizontal } from 'lucide-react';
import DeleteFolderModal from './DeleteFolderModal.jsx';
import axios from 'axios';
import { useMultiSelect } from '@/Pages/MultiSelectProvider.jsx';

const FolderItem = ({ folder, onRenameClick }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isStarred, setIsStarred] = useState(folder?.starred || false);
    const [deleting, setDeleting] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
    const [destinationFolders, setDestinationFolders] = useState([]);
    const [loadingDestinations, setLoadingDestinations] = useState(false);

    
    const {
        isSelectionMode,
        toggleFolderSelection,
        isFolderSelected
    } = useMultiSelect();

    
    const isSelected = isFolderSelected(folder.id);

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
                
                router.reload({ only: ['folders'] });
            },
            onError: (errors) => {
                console.error('Error moving folder:', errors);
                alert(`Error moving folder: ${errors.message || 'Please try again'}`);
            }
        });
    };

    return (
        <>
            <div className={`p-4 border dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow flex flex-col bg-white dark:bg-gray-800 ${isSelected ? 'ring-2 ring-indigo-500 dark:ring-indigo-400' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                    {isSelectionMode && (
                        <div className="mt-1 mr-2">
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleFolderSelection(folder)}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                        </div>
                    )}
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