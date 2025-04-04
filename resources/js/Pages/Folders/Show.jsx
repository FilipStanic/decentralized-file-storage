import React, { useState, useRef, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { FolderIcon, ChevronRight, FilePlus, Plus, MoreHorizontal, Download, Star, Trash2, File, FileText, Image } from 'lucide-react';
import axios from 'axios';
import Sidebar from '@/Pages/Sidebar';
import Header from '@/Pages/Header';
import UploadModal from '@/Pages/UploadModal';
import CreateFolderModal from '@/Pages/CreateFolderModal';

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

const FolderBreadcrumb = ({ breadcrumbs = [] }) => {
    return (
        <div className="flex items-center overflow-x-auto whitespace-nowrap my-4 pb-2">
            <Link href={route('folders.show')} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Folders
            </Link>

            {breadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={breadcrumb.id}>
                    <ChevronRight size={16} className="mx-1 text-gray-400" />
                    <Link
                        href={route('folders.show', breadcrumb.id)}
                        className={`${index === breadcrumbs.length - 1 ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        {breadcrumb.name}
                    </Link>
                </React.Fragment>
            ))}
        </div>
    );
};

export default function Show({ auth, currentFolder, breadcrumbs, folders, files }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [processingFolder, setProcessingFolder] = useState(false);

    const fileInputRef = useRef(null);
    const dropdownRef = useRef(null);
    const isAuthenticated = auth && auth.user;

    const [data, setData] = useState({
        file: null,
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [progress, setProgress] = useState(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleMoveFile = (fileId, folderId) => {
        axios.post(route('files.move', fileId), {
            folder_id: folderId
        }).then(() => {
            window.location.reload();
        }).catch((error) => {
            console.error('Error moving file:', error);
        });
    };

    const handleUpload = () => {
        setShowUploadModal(true);
    };

    const handleNewFolder = () => {
        setShowFolderModal(true);
    };

    const handleFileUpload = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setData({...data, file: e.target.files[0]});
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setData({...data, file: e.dataTransfer.files[0]});
        }
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();

        if (!data.file) return;

        setProcessing(true);

        const formData = new FormData();
        formData.append('file', data.file);
        if (currentFolder) {
            formData.append('folder_id', currentFolder.id);
        }

        axios.post(route('files.store'), formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: progressEvent => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setProgress(percentCompleted);
            }
        })
            .then(() => {
                setShowUploadModal(false);
                setData({file: null});
                setProcessing(false);
                window.location.reload();
            })
            .catch(error => {
                setProcessing(false);
                if (error.response && error.response.data.errors) {
                    setErrors(error.response.data.errors);
                }
            });
    };

    const handleCreateFolder = (folderData) => {
        setProcessingFolder(true);

        if (currentFolder) {
            folderData.parent_id = currentFolder.id;
        }

        axios.post(route('folders.store'), folderData)
            .then(() => {
                setShowFolderModal(false);
                window.location.reload();
            })
            .catch(error => {
                console.error('Error creating folder:', error);
            })
            .finally(() => {
                setProcessingFolder(false);
            });
    };

    return (
        <>
            <Head title={currentFolder ? currentFolder.name : 'All Folders'} />

            <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                {/* Sidebar */}
                <Sidebar
                    expanded={true}
                    onCreateNew={(type) => {
                        if (type === 'folder') {
                            setShowFolderModal(true);
                        } else {
                            setShowUploadModal(true);
                        }
                    }}
                />

                {/* Main content */}
                <div className="flex-1 p-4 overflow-auto bg-gray-50 dark:bg-gray-900">
                    {/* Header */}
                    <Header
                        isAuthenticated={isAuthenticated}
                        auth={auth}
                        onUserDropdownToggle={() => {}}
                    />

                    {/* Breadcrumb */}
                    <FolderBreadcrumb breadcrumbs={breadcrumbs} />

                    {/* Folder title */}
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-xl sm:text-2xl font-semibold dark:text-white">
                            {currentFolder ? currentFolder.name : 'All Files'}
                        </h1>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handleUpload}
                                className="flex items-center justify-center gap-1 px-3 sm:px-4 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                            >
                                <FilePlus size={16} className="hidden sm:block" />
                                <span>Upload</span>
                            </button>
                            <button
                                onClick={handleNewFolder}
                                className="flex items-center justify-center gap-1 px-3 sm:px-4 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white text-sm"
                            >
                                <Plus size={16} className="hidden sm:block" />
                                <span>New Folder</span>
                            </button>
                        </div>
                    </div>

                    {/* Folders section */}
                    {folders.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-lg font-medium mb-4 dark:text-white">Folders</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {folders.map((folder) => (
                                    <Link
                                        key={folder.id}
                                        href={route('folders.show', folder.id)}
                                        className="p-4 border dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow flex flex-col bg-white dark:bg-gray-800"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                                <FolderIcon size={24} style={{ color: folder.color || '#6366F1' }} />
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    axios.post(route('folders.toggle-star', folder.id))
                                                        .then(() => window.location.reload());
                                                }}
                                                className="text-gray-400 hover:text-yellow-400"
                                            >
                                                <Star
                                                    size={18}
                                                    fill={folder.starred ? "currentColor" : "none"}
                                                    className={folder.starred ? "text-yellow-400" : ""}
                                                />
                                            </button>
                                        </div>
                                        <h3 className="font-medium text-gray-900 dark:text-white mb-1 truncate">{folder.name}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {folder.item_count} {folder.item_count === 1 ? 'item' : 'items'} • {folder.last_modified}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Files section */}
                    <div>
                        <h2 className="text-lg font-medium mb-4 dark:text-white">Files</h2>

                        {files.length > 0 ? (
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

                                {files.map((file) => (
                                    <div key={file.id} className="grid grid-cols-12 px-4 py-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                                        <div className="col-span-5 md:col-span-6 flex items-center gap-2">
                                            <div className="flex-shrink-0">
                                                {getFileIcon(file.type)}
                                            </div>
                                            <span className="truncate dark:text-white">{file.name}</span>
                                        </div>
                                        <div className="col-span-3 md:col-span-2 hidden sm:flex items-center text-gray-600 dark:text-gray-400">
                                            {file.size}
                                        </div>
                                        <div className="col-span-2 md:col-span-2 hidden md:flex items-center text-gray-600 dark:text-gray-400">
                                            {file.lastModified}
                                        </div>
                                        <div className="col-span-7 sm:col-span-4 md:col-span-2 flex items-center justify-end gap-1">
                                            <Link
                                                onClick={() => {
                                                    window.location.href = route('files.download', file.id);
                                                }}
                                                className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                                            >
                                                <Download size={18} />
                                            </Link>
                                            <Link
                                                as="button"
                                                href={route('files.toggle-star', file.id)}
                                                method="post"
                                                className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded"
                                            >
                                                <Star
                                                    size={18}
                                                    fill={file.starred ? "currentColor" : "none"}
                                                    className={file.starred ? "text-yellow-400" : ""}
                                                />
                                            </Link>

                                            {/* Move to folder dropdown */}
                                            <div className="relative">
                                                <button
                                                    onClick={() => {
                                                        setSelectedFileId(file.id);
                                                        setDropdownOpen(prev => !prev);
                                                    }}
                                                    className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                                >
                                                    <MoreHorizontal size={18} />
                                                </button>

                                                {dropdownOpen && selectedFileId === file.id && (
                                                    <div ref={dropdownRef} className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 py-1 border dark:border-gray-700">
                                                        <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 font-medium border-b dark:border-gray-700">
                                                            Move to folder
                                                        </div>
                                                        <button
                                                            onClick={() => handleMoveFile(file.id, null)}
                                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        >
                                                            Root folder
                                                        </button>
                                                        {folders.map(folder => (
                                                            <button
                                                                key={folder.id}
                                                                onClick={() => handleMoveFile(file.id, folder.id)}
                                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                            >
                                                                {folder.name}
                                                            </button>
                                                        ))}
                                                        <div className="border-t dark:border-gray-700"></div>
                                                        <Link
                                                            href={route('files.destroy', file.id)}
                                                            method="delete"
                                                            as="button"
                                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        >
                                                            Delete
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>

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
                        ) : (
                            <div className="text-center py-8 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg">
                                <p className="text-gray-500 dark:text-gray-400">No files in this folder. Upload files to see them here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* File input for upload */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Upload Modal */}
            <UploadModal
                isOpen={showUploadModal}
                onClose={() => {
                    setShowUploadModal(false);
                    setData({file: null});
                }}
                file={data.file}
                dragActive={dragActive}
                handleDrag={handleDrag}
                handleDrop={handleDrop}
                handleFileUpload={handleFileUpload}
                handleFileChange={handleFileChange}
                handleSubmit={handleSubmit}
                fileInputRef={fileInputRef}
                processing={processing}
                errors={errors}
                progress={progress}
                folderId={currentFolder ? currentFolder.id : null}
            />

            {/* Create Folder Modal */}
            <CreateFolderModal
                isOpen={showFolderModal}
                onClose={() => setShowFolderModal(false)}
                onSubmit={handleCreateFolder}
                processing={processingFolder}
                parentId={currentFolder ? currentFolder.id : null}
            />
        </>
    );
}
