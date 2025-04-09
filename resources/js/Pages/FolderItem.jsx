import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { FolderIcon, Star, Trash2 } from 'lucide-react';
import DeleteFolderModal from './DeleteFolderModal';

const FolderItem = ({ folder }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    return (
        <>
            <div className="p-4 border dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow flex flex-col bg-white dark:bg-gray-800">
                <div className="flex items-start justify-between mb-3">
                    <Link href={route('folders.show', folder.id)} className="flex-1">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <FolderIcon size={24} style={{ color: folder.color || '#6366F1' }} />
                        </div>
                    </Link>
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={() => {
                                axios.post(route('folders.toggle-star', folder.id))
                                    .then(() => window.location.reload());
                            }}
                            className="text-gray-400 hover:text-yellow-400 p-1"
                        >
                            <Star
                                size={18}
                                fill={folder.starred ? "currentColor" : "none"}
                                className={folder.starred ? "text-yellow-400" : ""}
                            />
                        </button>

                        {/* Delete Button */}
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="text-gray-400 hover:text-red-600 p-1"
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

            {/* Delete Confirmation Modal */}
            <DeleteFolderModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                folder={folder}
            />
        </>
    );
};

export default FolderItem;
