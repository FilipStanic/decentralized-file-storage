import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { router } from '@inertiajs/core';
import { FolderIcon, Star, Trash2, Pencil } from 'lucide-react';
import DeleteFolderModal from './DeleteFolderModal.jsx';
import axios from 'axios';

const FolderItem = ({ folder, onRenameClick }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isStarred, setIsStarred] = useState(folder?.starred || false);
    const [deleting, setDeleting] = useState(false);

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

    return (
        <>
            <div className="p-4 border dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow flex flex-col bg-white dark:bg-gray-800">
                <div className="flex items-start justify-between mb-3">
                    <Link href={route('folders.show', folder.id)} className="flex-1">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <FolderIcon size={24} style={{ color: folder.color || '#6366F1' }} />
                        </div>
                    </Link>
                    <div className="flex items-center space-x-0.5">
                        <button
                            onClick={handleRename}
                            className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Rename Folder"
                        >
                            <Pencil size={18} />
                        </button>
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
