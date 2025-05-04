import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/core';
import { Trash2, RefreshCw, File, FolderIcon, AlertCircle, Star, FilePlus } from 'lucide-react';
import Sidebar from '@/Pages/Shared/Sidebar.jsx';
import Header from '@/Pages/Shared/Header.jsx';
import UploadModal from '@/Pages/UploadModal';
import { useSearch } from '@/Pages/Context/SearchContext.jsx';
import axios from 'axios';

const TrashItem = ({ item, onRestore, onDelete }) => {
    return (
        <div className="grid grid-cols-12 px-4 py-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm items-center gap-x-4">
            <div className="col-span-12 sm:col-span-6 md:col-span-5 flex items-center gap-2 overflow-hidden">
                <div className="flex-shrink-0">
                    {item.item_type === 'folder' ? (
                        <FolderIcon size={18} style={{ color: item.color || '#6366F1' }} />
                    ) : (
                        <File size={18} className="text-gray-500 dark:text-gray-400" />
                    )}
                </div>
                <span className="truncate dark:text-white">{item.name}</span>
                {item.item_type === 'folder' && item.item_count > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 whitespace-nowrap">
                        ({item.item_count} {item.item_count === 1 ? 'item' : 'items'})
                    </span>
                )}
                {item.starred && (
                    <span className="flex items-center ml-1">
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    </span>
                )}
            </div>
            <div className="col-span-6 sm:col-span-3 md:col-span-3 hidden sm:flex items-center text-gray-600 dark:text-gray-400">
                {item.trashed_at}
            </div>
            <div className="col-span-6 sm:col-span-3 md:col-span-2 hidden md:flex items-center text-amber-600 dark:text-amber-400">
                <AlertCircle size={14} className="mr-1 flex-shrink-0" />
                <span className="text-xs">{item.deleteAfter}</span>
            </div>
            <div className="col-span-12 sm:col-span-12 md:col-span-2 flex items-center justify-end gap-2 pt-2 sm:pt-0">
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

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);
    const [uploadData, setUploadData] = useState({ file: null });
    const [uploadProcessing, setUploadProcessing] = useState(false);
    const [uploadErrors, setUploadErrors] = useState({});
    const [uploadProgress, setUploadProgress] = useState(null);

    const handleUpload = () => setShowUploadModal(true);
    const handleFileUpload = () => fileInputRef.current.click();
    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setUploadData({ ...uploadData, file: e.target.files[0] });
            setShowUploadModal(true);
        }
    };
    const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type === "dragenter" || e.type === "dragover"); };
    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation(); setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setUploadData({ ...uploadData, file: e.dataTransfer.files[0] });
            setShowUploadModal(true);
        }
    };
    const handleUploadSubmit = (e) => {
        if (e) e.preventDefault();
        if (!uploadData.file) return;
        setUploadProcessing(true); setUploadProgress(0); setUploadErrors({});
        const formData = new FormData();
        formData.append('file', uploadData.file);
        formData.append('folder_id', '');
        axios.post(route('files.store'), formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: progressEvent => setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total))
        }).then(() => {
            setShowUploadModal(false); setUploadData({ file: null }); setUploadProgress(null);
            router.visit(route('home'));
        }).catch(error => {
            setUploadErrors(error.response?.data?.errors || { file: "Upload failed." });
        }).finally(() => {
            setUploadProcessing(false);
        });
    };

    const { searchTerm } = useSearch();
    
    const [currentTrashedItems, setCurrentTrashedItems] = useState([]);

    
    useEffect(() => {
        const allItems = [
            ...trashedFolders.map(folder => ({ ...folder, item_type: 'folder' })),
            ...trashedFiles.map(file => ({ ...file, item_type: 'file' }))
        ];
        setCurrentTrashedItems(allItems.sort((a, b) => {
            const getTimeValue = (timeString) => {
                const num = parseInt(timeString?.split(' ')[0] || '0');
                if (timeString?.includes('second')) return num;
                if (timeString?.includes('minute')) return num * 60;
                if (timeString?.includes('hour')) return num * 3600;
                if (timeString?.includes('day')) return num * 86400;
                if (timeString?.includes('week')) return num * 604800;
                if (timeString?.includes('month')) return num * 2592000;
                return Date.now();
            };
            return getTimeValue(a.trashed_at) - getTimeValue(b.trashed_at);
        }));
    }, [trashedFiles, trashedFolders]);

    
    const filteredItems = !searchTerm.trim()
        ? currentTrashedItems
        : currentTrashedItems.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));


    const handleRestore = (itemToRestore) => {
        
        setCurrentTrashedItems(prevItems =>
            prevItems.filter(item => !(item.item_type === itemToRestore.item_type && item.id === itemToRestore.id))
        );

        router.post(route('trash.restore'), {
            item_type: itemToRestore.item_type,
            item_id: itemToRestore.id
        }, {
            preserveState: true, 
            preserveScroll: true, 
            only: ['trashedFiles', 'trashedFolders'], 
            onSuccess: () => {
                
                
            },
            onError: (errors) => {
                console.error('Error restoring item:', errors);
                
                setCurrentTrashedItems(prevItems => [...prevItems, itemToRestore].sort((a, b) => { /* add sort logic back if needed */ }));
                alert('Failed to restore item. Please try again.');
            },
            onFinish: () => {
                
            }
        });
    };


    const handleDelete = (itemToDelete) => {
        if (confirm(`Permanently delete ${itemToDelete.name}? This action cannot be undone.`)) {
            setIsLoading(true); 
            router.delete(route('trash.delete'), {
                data: {
                    item_type: itemToDelete.item_type,
                    item_id: itemToDelete.id
                },
                preserveState: true, 
                preserveScroll: true, 
                only: ['trashedFiles', 'trashedFolders'], 
                onSuccess: () => {
                    
                    setCurrentTrashedItems(prevItems =>
                        prevItems.filter(item => !(item.item_type === itemToDelete.item_type && item.id === itemToDelete.id))
                    );
                },
                onError: (errors) => {
                    console.error('Error deleting item:', errors);
                    alert('Failed to permanently delete item.');
                },
                onFinish: () => setIsLoading(false)
            });
        }
    };

    const handleEmptyTrash = () => {
        if (confirm('Permanently delete all items in trash? This action cannot be undone.')) {
            setIsEmptyingTrash(true);
            router.post(route('trash.empty'), {}, {
                preserveState: true, 
                preserveScroll: true, 
                only: ['trashedFiles', 'trashedFolders'], 
                onSuccess: () => {
                    setCurrentTrashedItems([]); 
                },
                onError: (errors) => {
                    console.error('Error emptying trash:', errors);
                    alert('Failed to empty trash.');
                },
                onFinish: () => setIsEmptyingTrash(false)
            });
        }
    };

    return (
        <>
            <Head title="Trash" />
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

            <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                <Sidebar expanded={true} onCreateNew={handleUpload} />

                <div className="flex-1 p-4 overflow-auto bg-gray-50 dark:bg-gray-900" onDragOver={handleDrag} onDragEnter={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}>
                    <Header isAuthenticated={isAuthenticated} auth={auth} onUserDropdownToggle={() => {}} />

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center">
                                <Trash2 size={24} className="mr-2 text-gray-500 dark:text-gray-400" />
                                {searchTerm ? `Search Results in Trash` : 'Trash'}
                            </h1>
                            {searchTerm ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Found {filteredItems.length} {filteredItems.length === 1 ? 'result' : 'results'} for "{searchTerm}"</p>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Items in the trash will be automatically deleted after 24 hours
                                </p>
                            )}
                        </div>

                        {currentTrashedItems.length > 0 && !searchTerm &&(
                            <button
                                onClick={handleEmptyTrash}
                                disabled={isLoading || isEmptyingTrash} 
                                className="mt-4 md:mt-0 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 flex items-center justify-center disabled:opacity-70"
                            >
                                {isEmptyingTrash ? 'Emptying...' : (isLoading ? 'Processing...' : 'Empty Trash')}
                            </button>
                        )}
                    </div>

                    {filteredItems.length > 0 ? (
                        <div className="border dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
                            <div className="grid grid-cols-12 px-4 py-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 gap-x-4">
                                <div className="col-span-12 sm:col-span-6 md:col-span-5">Name</div>
                                <div className="col-span-6 sm:col-span-3 md:col-span-3 hidden sm:block">Deleted</div>
                                <div className="col-span-6 sm:col-span-3 md:col-span-2 hidden md:block">Auto-Delete</div>
                                <div className="col-span-12 sm:col-span-12 md:col-span-2 text-right">Actions</div>
                            </div>
                            {filteredItems.map((item) => (
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
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                {searchTerm ? `No items matching "${searchTerm}"` : 'Trash is Empty'}
                            </h3>
                            <p className="mt-2 text-gray-500 dark:text-gray-400">
                                {searchTerm ? 'Try searching for something else.' : 'Items you delete will appear here.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <UploadModal
                isOpen={showUploadModal}
                onClose={() => { setShowUploadModal(false); setUploadData({ file: null }); setUploadProgress(null); setUploadErrors({}); }}
                file={uploadData.file}
                dragActive={dragActive} handleDrag={handleDrag} handleDrop={handleDrop}
                handleFileUpload={handleFileUpload} handleFileChange={handleFileChange}
                handleSubmit={handleUploadSubmit} fileInputRef={fileInputRef}
                processing={uploadProcessing} errors={uploadErrors} progress={uploadProgress}
                folderId={null}
            />
        </>
    );
}
