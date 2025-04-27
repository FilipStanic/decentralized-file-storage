import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import { router } from '@inertiajs/core';
import { Download, Star, Trash2, File, FileText, Image, FolderIcon, MoreHorizontal, Info } from 'lucide-react';
import axios from 'axios';
import FileDetailModal from './FileDetailModal';
import ConfirmDeleteModal from '@/Pages/ConfirmDeleteModal.jsx';

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
            return <File className="text-gray-500 dark:text-gray-400" />;
    }
};

export const RecentFiles = ({ recentFiles }) => {
    const [currentFiles, setCurrentFiles] = useState(recentFiles || []);
    const [folders, setFolders] = useState([]);
    const [loadingFolders, setLoadingFolders] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const dropdownRef = useRef(null);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        setCurrentFiles(recentFiles || []);
    }, [recentFiles]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    useEffect(() => {
        setLoadingFolders(true);
        axios.get(route('sidebar.data'))
            .then(response => {
                setFolders(response.data.rootFolders || []);
                setLoadingFolders(false);
            })
            .catch(error => {
                console.error('Error fetching folders:', error);
                setLoadingFolders(false);
            });
    }, []);

    const handleMoveFile = (fileId, folderId) => {
        router.post(route('files.move', fileId), {
            folder_id: folderId
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setDropdownOpen(null);
            },
            onError: (errors) => {
                console.error('Error moving file:', errors);
                alert(`Error moving file: ${errors.message || 'Please try again.'}`);
            }
        });
    };

    const toggleDropdown = (fileId) => {
        setDropdownOpen(prev => (prev === fileId ? null : fileId));
    };

    const handleShowDetails = (file) => {
        setSelectedFile(file);
        setShowDetailModal(true);
    };

    const handleDeleteClick = (event, file) => {
        event.preventDefault();
        event.stopPropagation();
        setItemToDelete(file);
        setShowConfirmModal(true);
        setDropdownOpen(null);
    };

    const confirmDeleteAction = () => {
        if (!itemToDelete || !itemToDelete.id) {
            console.error('No valid item to delete');
            setShowConfirmModal(false);
            setItemToDelete(null);
            return;
        }

        try {
            
            setCurrentFiles(prevFiles => prevFiles.filter(f => f.id !== itemToDelete.id));
            setShowConfirmModal(false);

            
            router.delete(route('files.destroy', itemToDelete.id), {
                preserveScroll: true,
                onSuccess: () => {
                    
                    setItemToDelete(null);
                },
                onError: (errors) => {
                    console.error('Error deleting item:', errors);
                    
                    setCurrentFiles(recentFiles);
                    alert('Failed to delete the item. Please try again.');
                    setItemToDelete(null);
                }
            });
        } catch (error) {
            console.error('Exception during delete operation:', error);
            setCurrentFiles(recentFiles);
            alert('An unexpected error occurred. Please try again.');
            setShowConfirmModal(false);
            setItemToDelete(null);
        }
    };

    const handleToggleStar = (event, fileId) => {
        event.preventDefault();

        
        setCurrentFiles(prevFiles =>
            prevFiles.map(f => f.id === fileId ? {...f, starred: !f.starred} : f)
        );

        
        router.post(route('files.toggle-star', fileId), {}, {
            preserveScroll: true,
            onError: () => {
                
                setCurrentFiles(recentFiles);
            }
        });
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium dark:text-white">Recent</h2>
            </div>

            {currentFiles.length > 0 ? (
                <div className="border dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
                    <div className="grid grid-cols-12 px-4 py-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300 gap-x-4">
                        <div className="col-span-5 md:col-span-6 flex items-center gap-2">Name</div>
                        <div className="col-span-3 md:col-span-2 hidden sm:flex items-center gap-2">Size</div>
                        <div className="col-span-2 md:col-span-2 hidden md:flex items-center gap-2">Modified</div>
                        <div className="col-span-7 sm:col-span-4 md:col-span-2 flex items-center justify-end gap-2">Actions</div>
                    </div>

                    {currentFiles.map((file) => (
                        <div key={file.id} className="grid grid-cols-12 px-4 py-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm items-center gap-x-4">
                            <div className="col-span-5 md:col-span-6 flex items-center gap-2 overflow-hidden">
                                <div className="flex-shrink-0">{getFileIcon(file.type)}</div>
                                <span className="truncate dark:text-white">{file.name}</span>
                                {file.folder_name && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full ml-1 whitespace-nowrap">
                                        {file.folder_name}
                                    </span>
                                )}
                                {file.ipfs_hash && (
                                    <span className="text-xs text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full ml-1 whitespace-nowrap">
                                        IPFS
                                    </span>
                                )}
                            </div>
                            <div className="col-span-3 md:col-span-2 hidden sm:flex items-center text-gray-600 dark:text-gray-400">{file.size}</div>
                            <div className="col-span-2 md:col-span-2 hidden md:flex items-center text-gray-600 dark:text-gray-400">{file.lastModified}</div>
                            <div className="col-span-7 sm:col-span-4 md:col-span-2 flex items-center justify-end gap-1 flex-wrap">
                                <button
                                    onClick={() => handleShowDetails(file)}
                                    className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                    title="File Details"
                                >
                                    <Info size={18} />
                                </button>
                                <a
                                    href={route('files.download', file.id)}
                                    className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                    title="Download"
                                >
                                    <Download size={18} />
                                </a>
                                <button
                                    onClick={(e) => handleToggleStar(e, file.id)}
                                    className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded"
                                    title={file.starred ? "Unstar" : "Star"}
                                >
                                    <Star size={18} fill={file.starred ? "currentColor" : "none"} className={file.starred ? "text-yellow-400" : ""} />
                                </button>
                                <div className="relative">
                                    <button
                                        onClick={() => toggleDropdown(file.id)}
                                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                        title="More options"
                                    >
                                        <MoreHorizontal size={18} />
                                    </button>
                                    {dropdownOpen === file.id && (
                                        <div ref={dropdownRef} className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 py-1 border dark:border-gray-700">
                                            <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 font-medium border-b dark:border-gray-700">Move to folder</div>
                                            <button onClick={() => handleMoveFile(file.id, null)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                Root folder
                                            </button>
                                            {loadingFolders ? (
                                                <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                                            ) : (
                                                folders.map(folder => (
                                                    <button key={folder.id} onClick={() => handleMoveFile(file.id, folder.id)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                        {folder.name}
                                                    </button>
                                                ))
                                            )}
                                            <div className="border-t dark:border-gray-700 my-1"></div>
                                            <button
                                                type="button"
                                                onClick={(e) => handleDeleteClick(e, file)}
                                                className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => handleDeleteClick(e, file)}
                                    className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">No files yet. Upload files to see them here.</p>
                </div>
            )}

            <FileDetailModal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                file={selectedFile}
            />

            <ConfirmDeleteModal
                isOpen={showConfirmModal}
                onClose={() => {
                    setShowConfirmModal(false);
                    setItemToDelete(null);
                }}
                onConfirm={confirmDeleteAction}
                itemName={itemToDelete?.name}
                itemType="file"
            />
        </div>
    );
};

export default RecentFiles;
