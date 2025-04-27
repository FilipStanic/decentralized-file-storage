import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Star, File, FileText, Image, FolderIcon, Download, Trash2 } from 'lucide-react';
import axios from 'axios';

const getFileIcon = (type) => {
    switch (type) {
        case 'Image':
            return <Image className="text-green-500" />;
        case 'PDF':
            return <FileText className="text-red-500" />;
        case 'Spreadsheet':
            return <FileText className="text-emerald-500" />;
        case 'Presentation':
            return <FileText className="text-orange-500" />;
        case 'Document':
            return <FileText className="text-blue-500" />;
        default:
            return <File className="text-gray-500" />;
    }
};

export const StarredItems = ({ items, type }) => {
    const [starredItems, setStarredItems] = useState(items);

    const handleToggleFolderStar = (e, folderId) => {
        e.preventDefault();
        axios.post(route('folders.toggle-star', folderId))
            .then(response => {
                
                if (response.data.success) {
                    setStarredItems(prevItems => prevItems.filter(item => item.id !== folderId));
                }
            })
            .catch(error => console.error('Error toggling folder star:', error));
    };

    const handleToggleFileStar = (e, fileId) => {
        e.preventDefault();
        axios.post(route('files.toggle-star', fileId))
            .then(() => {
                
                setStarredItems(prevItems => prevItems.filter(item => item.id !== fileId));
            })
            .catch(error => console.error('Error toggling file star:', error));
    };

    return (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium dark:text-white">
                    {type === 'folders' ? 'Starred Folders' : 'Starred Files'}
                </h2>
            </div>

            {starredItems.length > 0 ? (
                type === 'folders' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {starredItems.map((folder) => (
                            <div
                                key={folder.id}
                                className="p-4 border dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow flex flex-col bg-white dark:bg-gray-800"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <Link href={route('folders.show', folder.id)}>
                                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                            <FolderIcon size={24} style={{ color: folder.color || '#6366F1' }} />
                                        </div>
                                    </Link>
                                    <button
                                        onClick={(e) => handleToggleFolderStar(e, folder.id)}
                                        className="text-gray-400 hover:text-yellow-400"
                                    >
                                        <Star
                                            size={18}
                                            fill="currentColor"
                                            className="text-yellow-400"
                                        />
                                    </button>
                                </div>
                                <Link href={route('folders.show', folder.id)}>
                                    <h3 className="font-medium text-gray-900 dark:text-white mb-1 truncate">{folder.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {folder.item_count} {folder.item_count === 1 ? 'item' : 'items'} • {folder.lastModified}
                                    </p>
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="border dark:border-gray-700 rounded-md overflow-hidden bg-white dark:bg-gray-800">
                        <div className="grid grid-cols-12 px-4 py-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300">
                            <div className="col-span-5 md:col-span-6 flex items-center gap-2">
                                Name
                            </div>
                            <div className="col-span-3 md:col-span-2 hidden sm:flex items-center gap-2">
                                Size
                            </div>
                            <div className="col-span-2 md:col-span-2 hidden md:flex items-center gap-2">
                                Modified
                            </div>
                            <div className="col-span-7 sm:col-span-4 md:col-span-2 flex items-center justify-end gap-2">
                                Actions
                            </div>
                        </div>

                        {starredItems.map((file) => (
                            <div key={file.id} className="grid grid-cols-12 px-4 py-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                                <div className="col-span-5 md:col-span-6 flex items-center gap-2">
                                    <div className="flex-shrink-0">
                                        {getFileIcon(file.type)}
                                    </div>
                                    <span className="truncate dark:text-white">{file.name}</span>
                                    {file.folder_name && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                                            {file.folder_name}
                                        </span>
                                    )}
                                </div>
                                <div className="col-span-3 md:col-span-2 hidden sm:flex items-center text-gray-600 dark:text-gray-400">
                                    {file.size}
                                </div>
                                <div className="col-span-2 md:col-span-2 hidden md:flex items-center text-gray-600 dark:text-gray-400">
                                    {file.lastModified}
                                </div>
                                <div className="col-span-7 sm:col-span-4 md:col-span-2 flex items-center justify-end gap-1 flex-wrap">
                                    <Link
                                        href={route('files.download', file.id)}
                                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                                    >
                                        <Download size={18} />
                                    </Link>
                                    <button
                                        onClick={(e) => handleToggleFileStar(e, file.id)}
                                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded"
                                    >
                                        <Star
                                            size={18}
                                            fill="currentColor"
                                            className="text-yellow-400"
                                        />
                                    </button>
                                    <Link
                                        href={route('files.destroy', file.id)}
                                        method="delete"
                                        as="button"
                                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                    >
                                        <Trash2 size={18} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                <div className="text-center py-8 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">
                        No starred {type === 'folders' ? 'folders' : 'files'} yet. Click the star icon on any {type === 'folders' ? 'folder' : 'file'} to add it here.
                    </p>
                </div>
            )}
        </div>
    );
};

export default StarredItems;
