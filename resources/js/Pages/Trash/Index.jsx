import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Trash2, RefreshCw, File, FolderIcon, AlertCircle } from 'lucide-react';
import Sidebar from '@/Pages/Shared/Sidebar.jsx';
import Header from '@/Pages/Shared/Header.jsx';
import axios from 'axios';

const TrashItem = ({ item, onRestore, onDelete }) => {
    return (
        <div className="grid grid-cols-12 px-4 py-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm items-center">
            <div className="col-span-5 md:col-span-5 flex items-center gap-2 overflow-hidden">
                <div className="flex-shrink-0">
                    {item.item_type === 'folder' ? (
                        <FolderIcon size={18} style={{ color: item.color || '#6366F1' }} />
                    ) : (
                        <File size={18} className="text-gray-500" />
                    )}
                </div>
                <span className="truncate dark:text-white">{item.name}</span>
                {item.item_type === 'folder' && item.item_count > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({item.item_count} {item.item_count === 1 ? 'item' : 'items'})
                    </span>
                )}
            </div>
            <div className="col-span-3 md:col-span-4 hidden sm:flex items-center text-gray-600 dark:text-gray-400">
                Deleted {item.trashed_at}
            </div>
            <div className="col-span-4 md:col-span-3 hidden sm:flex items-center text-amber-600 dark:text-amber-400">
                <AlertCircle size={14} className="mr-1" />
                <span className="text-xs">Deletes {item.deleteAfter}</span>
            </div>
            <div className="col-span-7 sm:col-span-4 md:col-span-3 lg:col-span-2 flex items-center justify-end gap-2">
                <button
                    onClick={() => onRestore(item)}
                    className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                    title="Restore"
                >
                    <RefreshCw size={18} />
                </button>
                <button
                    onClick={() => onDelete(item)}
                    className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    title="Delete Permanently"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

export default function TrashIndex({ auth, trashedFiles, trashedFolders }) {
    const [isEmptyingTrash, setIsEmptyingTrash] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const isAuthenticated = auth && auth.user;

    const handleRestore = (item) => {
        setIsLoading(true);
        axios.post(route('trash.restore'), {
            item_type: item.item_type,
            item_id: item.id
        })
            .then(() => {
                window.location.reload();
            })
            .catch(error => {
                console.error('Error restoring item:', error);
                setIsLoading(false);
            });
    };

    const handleDelete = (item) => {
        if (confirm(`Permanently delete ${item.name}? This action cannot be undone.`)) {
            setIsLoading(true);
            axios.delete(route('trash.delete'), {
                data: {
                    item_type: item.item_type,
                    item_id: item.id
                }
            })
                .then(() => {
                    window.location.reload();
                })
                .catch(error => {
                    console.error('Error deleting item:', error);
                    setIsLoading(false);
                });
        }
    };

    const handleEmptyTrash = () => {
        if (confirm('Permanently delete all items in trash? This action cannot be undone.')) {
            setIsEmptyingTrash(true);
            axios.post(route('trash.empty'))
                .then(() => {
                    window.location.reload();
                })
                .catch(error => {
                    console.error('Error emptying trash:', error);
                    setIsEmptyingTrash(false);
                });
        }
    };

    // Sort trashed items by their trashed_at date (newer first)
    const allTrashedItems = [
        ...trashedFolders.map(folder => ({ ...folder, item_type: 'folder' })),
        ...trashedFiles.map(file => ({ ...file, item_type: 'file' }))
    ].sort((a, b) => {
        // Parse human-readable dates
        const getTimeValue = (timeString) => {
            const num = parseInt(timeString.split(' ')[0]);
            if (timeString.includes('second')) return num;
            if (timeString.includes('minute')) return num * 60;
            if (timeString.includes('hour')) return num * 3600;
            if (timeString.includes('day')) return num * 86400;
            if (timeString.includes('week')) return num * 604800;
            if (timeString.includes('month')) return num * 2592000;
            return 0;
        };

        // Lower value means MORE recent
        const aValue = getTimeValue(a.trashed_at);
        const bValue = getTimeValue(b.trashed_at);

        return aValue - bValue;
    });

    if (isLoading) {
        return (
            <>
                <Head title="Processing..." />
                <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                    <Sidebar expanded={true} onCreateNew={() => {}} />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
                            <div className="text-gray-700 dark:text-gray-300">Processing...</div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Trash" />

            <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                <Sidebar expanded={true} onCreateNew={() => {}} />

                <div className="flex-1 p-4 overflow-auto bg-gray-50 dark:bg-gray-900">
                    <Header isAuthenticated={isAuthenticated} auth={auth} onUserDropdownToggle={() => {}} />

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center">
                                <Trash2 size={24} className="mr-2 text-gray-500" />
                                Trash
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Items in the trash will be automatically deleted after 24 hours
                            </p>
                        </div>

                        {allTrashedItems.length > 0 && (
                            <button
                                onClick={handleEmptyTrash}
                                disabled={isEmptyingTrash}
                                className="mt-4 md:mt-0 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center justify-center disabled:opacity-70"
                            >
                                {isEmptyingTrash ? (
                                    <>
                                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        Emptying...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} className="mr-2" />
                                        Empty Trash
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {allTrashedItems.length > 0 ? (
                        <div className="border dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 shadow-sm">
                            <div className="grid grid-cols-12 px-4 py-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300">
                                <div className="col-span-5 md:col-span-5 flex items-center gap-2">Name</div>
                                <div className="col-span-3 md:col-span-4 hidden sm:flex items-center gap-2">Deleted</div>
                                <div className="col-span-4 md:col-span-3 hidden sm:flex items-center gap-2">Auto-Delete</div>
                                <div className="col-span-7 sm:col-span-4 md:col-span-3 lg:col-span-2 flex items-center justify-end gap-2">Actions</div>
                            </div>

                            {allTrashedItems.map((item) => (
                                <TrashItem
                                    key={`${item.item_type}-${item.id}`}
                                    item={item}
                                    onRestore={handleRestore}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm">
                            <div className="inline-flex rounded-full bg-gray-100 dark:bg-gray-700 p-4 mb-4">
                                <Trash2 size={24} className="text-gray-500 dark:text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Trash is Empty</h3>
                            <p className="mt-2 text-gray-500 dark:text-gray-400">
                                Items you delete will appear here for 24 hours before being permanently removed.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
