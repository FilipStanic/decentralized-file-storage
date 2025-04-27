import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronRight, FilePlus, Plus, MoreHorizontal, Download, Star, Trash2, File, FileText, Image, FolderIcon, Info } from 'lucide-react';
import axios from 'axios';
import Sidebar from '@/Pages/Shared/Sidebar.jsx';
import Header from '@/Pages/Shared/Header.jsx';
import UploadModal from '@/Pages/UploadModal';
import CreateFolderModal from '@/Pages/Folders/CreateFolderModal.jsx';
import FolderItem from '@/Pages/Folders/FolderItem.jsx';
import RenameFolderModal from '@/Pages/Folders/RenameFolderModal.jsx';
import ConfirmDeleteModal from '@/Pages/ConfirmDeleteModal.jsx';
import { useSearch } from '@/Pages/Context/SearchContext.jsx';
import FileDetailModal from '@/Pages/Files/FileDetailModal.jsx';

const getFileIcon = (type) => {
    switch (type) {
        case 'Image': return <Image className="text-green-500" />;
        case 'PDF': return <FileText className="text-red-500" />;
        case 'Spreadsheet': return <FileText className="text-emerald-500" />;
        case 'Presentation': return <FileText className="text-orange-500" />;
        case 'Document': return <FileText className="text-blue-500" />;
        default: return <File className="text-gray-500" />;
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

export default function FolderView({ auth, currentFolder, breadcrumbs, folders, files }) {
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [folderToRename, setFolderToRename] = useState(null);
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const [dragActive, setDragActive] = useState(false);
    const [processingFolder, setProcessingFolder] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [destinationFolders, setDestinationFolders] = useState([]);
    const [loadingDestinations, setLoadingDestinations] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(null);

    const { searchTerm, isSearching } = useSearch();
    const [filteredFolders, setFilteredFolders] = useState(folders);
    const [filteredFiles, setFilteredFiles] = useState(files);
    const [totalResults, setTotalResults] = useState(0);

    const fileInputRef = useRef(null);
    const dropdownRef = useRef(null);
    const isAuthenticated = auth && auth.user;

    const [data, setData] = useState({ file: null });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [progress, setProgress] = useState(null);

    useEffect(() => {
        setLoadingDestinations(true);
        axios.get(route('sidebar.data'))
            .then(response => {
                const currentFolderId = currentFolder ? currentFolder.id : null;
                setDestinationFolders(
                    (response.data.rootFolders || []).filter(f => f.id !== currentFolderId)
                );
                setLoadingDestinations(false);
            })
            .catch(error => {
                console.error('Error fetching destination folders:', error);
                setLoadingDestinations(false);
            });
    }, [currentFolder]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredFolders(folders);
            setFilteredFiles(files);
            setTotalResults(folders.length + files.length);
            return;
        }
        const lowerCaseTerm = searchTerm.toLowerCase();
        const matchingFolders = folders.filter(folder => folder.name.toLowerCase().includes(lowerCaseTerm));
        const matchingFiles = files.filter(file => file.name.toLowerCase().includes(lowerCaseTerm));
        setFilteredFolders(matchingFolders);
        setFilteredFiles(matchingFiles);
        setTotalResults(matchingFolders.length + matchingFiles.length);
    }, [searchTerm, folders, files]);

    const handleMoveFile = (fileId, folderId) => {
        axios.post(route('files.move', fileId), { folder_id: folderId })
            .then(() => window.location.reload())
            .catch(error => console.error('Error moving file:', error))
            .finally(() => setDropdownOpen(null));
    };

    const handleUpload = () => setShowUploadModal(true);
    const handleNewFolder = () => setShowFolderModal(true);
    const handleFileUpload = () => fileInputRef.current.click();

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setData({ ...data, file: e.target.files[0] });
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === "dragenter" || e.type === "dragover");
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) {
            setData({ ...data, file: e.dataTransfer.files[0] });
            setShowUploadModal(true);
        }
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (!data.file) return;

        setProcessing(true);
        setProgress(0);

        const formData = new FormData();
        formData.append('file', data.file);

        if (currentFolder) {
            formData.append('folder_id', currentFolder.id);
        }

        axios.post(route('files.store'), formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: p => setProgress(Math.round((p.loaded * 100) / p.total))
        })
            .then(() => {
                setShowUploadModal(false);
                setData({ file: null });
                setProgress(null);
                window.location.reload();
            })
            .catch(err => {
                setErrors(err.response?.data?.errors || { file: "Upload failed." });
            })
            .finally(() => setProcessing(false));
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
            .catch(error => console.error('Error creating folder:', error))
            .finally(() => setProcessingFolder(false));
    };

    const toggleDropdown = (fileId) => {
        setDropdownOpen(prev => (prev === fileId ? null : fileId));
    };

    const handleShowDetails = (file) => {
        setSelectedFile(file);
        setShowDetailModal(true);
    };

    const handleRenameClick = (folder) => {
        setFolderToRename(folder);
        setShowRenameModal(true);
    };

    const handleDeleteClick = (event, file) => {
        event.preventDefault();
        event.stopPropagation();
        setItemToDelete(file);
        setShowConfirmDeleteModal(true);
        setDropdownOpen(null);
    };

    const confirmDeleteAction = () => {
        if (!itemToDelete) return;

        router.delete(route('files.destroy', itemToDelete.id), {
            preserveScroll: true,
            preserveState: true,
            only: ['files'],
            onSuccess: () => {
                setFilteredFiles(prev => prev.filter(f => f.id !== itemToDelete.id));
                setShowConfirmDeleteModal(false);
                setItemToDelete(null);
            },
            onError: (errors) => {
                console.error('Error deleting item:', errors);
                alert('Failed to delete the item. Please try again.');
                setShowConfirmDeleteModal(false);
                setItemToDelete(null);
            }
        });
    };

    const handleFileToggleStar = (event, fileId) => {
        event.preventDefault();
        router.post(route('files.toggle-star', fileId), {}, {
            preserveScroll: true,
            preserveState: true,
            only: ['files', 'quickAccessFiles'],
            onSuccess: () => {
                setFilteredFiles(prevFiles => prevFiles.map(f =>
                    f.id === fileId ? {...f, starred: !f.starred} : f
                ));
            }
        });
    };

    return (
        <>
            <Head title={currentFolder ? currentFolder.name : 'All Folders'} />
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

            <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                <Sidebar expanded={true} onCreateNew={(type) => type === 'folder' ? handleNewFolder() : handleUpload()} />

                <div className="flex-1 p-4 overflow-auto bg-gray-50 dark:bg-gray-900"
                     onDragOver={handleDrag}
                     onDragEnter={handleDrag}
                     onDragLeave={handleDrag}
                     onDrop={handleDrop}>
                    <Header isAuthenticated={isAuthenticated} auth={auth} onUserDropdownToggle={() => {}} />
                    <FolderBreadcrumb breadcrumbs={breadcrumbs} />

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-semibold dark:text-white truncate">
                                {isSearching
                                    ? `Search Results in ${currentFolder ? currentFolder.name : 'All Folders'}`
                                    : (currentFolder ? currentFolder.name : 'Folders')}
                            </h1>
                            {isSearching && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Found {totalResults} {totalResults === 1 ? 'result' : 'results'} for "{searchTerm}"
                                </p>
                            )}
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                            <button
                                onClick={handleNewFolder}
                                className="flex items-center justify-center gap-1 px-3 sm:px-4 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                            >
                                <Plus size={16} className="hidden sm:block" />
                                <span>New Folder</span>
                            </button>
                        </div>
                    </div>

                    {filteredFolders.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-lg font-medium mb-4 dark:text-white">
                                {isSearching ? 'Folders Found' : 'Folders'}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {filteredFolders.map((folder) => (
                                    <FolderItem key={folder.id} folder={folder} onRenameClick={handleRenameClick} />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mb-8">
                        <h2 className="text-lg font-medium mb-4 dark:text-white">
                            {isSearching ? 'Files Found' : 'Files'}
                        </h2>
                        {filteredFiles.length > 0 ? (
                            <div className="border dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 overflow-hidden">
                                <div className="grid grid-cols-12 px-4 py-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="col-span-5 md:col-span-6 flex items-center gap-2">Name</div>
                                    <div className="col-span-3 md:col-span-2 hidden sm:flex items-center gap-2">Size</div>
                                    <div className="col-span-2 md:col-span-2 hidden md:flex items-center gap-2">Modified</div>
                                    <div className="col-span-7 sm:col-span-4 md:col-span-2 flex items-center justify-end gap-2">Actions</div>
                                </div>

                                {filteredFiles.map((file) => (
                                    <div key={file.id} className="grid grid-cols-12 px-4 py-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm items-center">
                                        <div className="col-span-5 md:col-span-6 flex items-center gap-2 overflow-hidden">
                                            <div className="flex-shrink-0">{getFileIcon(file.type)}</div>
                                            <span className="truncate dark:text-white">{file.name}</span>
                                            {file.ipfs_hash && (
                                                <span className="text-xs text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full ml-1 whitespace-nowrap">
                                                    IPFS
                                                </span>
                                            )}
                                        </div>

                                        <div className="col-span-3 md:col-span-2 hidden sm:flex items-center text-gray-600 dark:text-gray-400">
                                            {file.size}
                                        </div>

                                        <div className="col-span-2 md:col-span-2 hidden md:flex items-center text-gray-600 dark:text-gray-400">
                                            {file.lastModified}
                                        </div>

                                        <div className="col-span-7 sm:col-span-4 md:col-span-2 flex items-center justify-end gap-1 flex-wrap py-1">
                                            <button
                                                onClick={() => handleShowDetails(file)}
                                                className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                                title="File Details"
                                            >
                                                <Info size={18} />
                                            </button>

                                            <a
                                                href={route('files.download', file.id)}
                                                className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                                title="Download"
                                            >
                                                <Download size={18} />
                                            </a>

                                            <button
                                                onClick={(e) => handleFileToggleStar(e, file.id)}
                                                className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded"
                                                title={file.starred ? "Unstar" : "Star"}
                                            >
                                                <Star
                                                    size={18}
                                                    fill={file.starred ? "currentColor" : "none"}
                                                    className={file.starred ? "text-yellow-400" : ""}
                                                />
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
                                                    <div
                                                        ref={dropdownRef}
                                                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 py-1 border dark:border-gray-700"
                                                    >
                                                        <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 font-medium border-b dark:border-gray-700">
                                                            Move to folder
                                                        </div>

                                                        <button
                                                            onClick={() => handleMoveFile(file.id, null)}
                                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        >
                                                            Root folder
                                                        </button>

                                                        {loadingDestinations ? (
                                                            <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                                                        ) : (
                                                            destinationFolders.map(folder => (
                                                                <button
                                                                    key={folder.id}
                                                                    onClick={() => handleMoveFile(file.id, folder.id)}
                                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                >
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
                                {isSearching ? (
                                    <p className="text-gray-500 dark:text-gray-400">
                                        No files matching "{searchTerm}" {currentFolder ? 'in this folder' : ''}.
                                    </p>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">
                                        No files {currentFolder ? 'in this folder' : ''}. Upload files to see them here.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {isSearching && totalResults === 0 && (
                        <div className="text-center py-8 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg mt-4">
                            <p className="text-gray-500 dark:text-gray-400">
                                No items matching "{searchTerm}" {currentFolder ? 'in this folder' : 'found'}.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <UploadModal
                isOpen={showUploadModal}
                onClose={() => {
                    setShowUploadModal(false);
                    setData({ file: null });
                    setProgress(null);
                    setErrors({});
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
                folderId={currentFolder?.id}
            />

            <CreateFolderModal
                isOpen={showFolderModal}
                onClose={() => setShowFolderModal(false)}
                onSubmit={handleCreateFolder}
                processing={processingFolder}
                parentId={currentFolder?.id}
            />

            <FileDetailModal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                file={selectedFile}
            />

            <RenameFolderModal
                isOpen={showRenameModal}
                onClose={() => {
                    setShowRenameModal(false);
                    setFolderToRename(null);
                }}
                folder={folderToRename}
            />

            <ConfirmDeleteModal
                isOpen={showConfirmDeleteModal}
                onClose={() => {
                    setShowConfirmDeleteModal(false);
                    setItemToDelete(null);
                }}
                onConfirm={confirmDeleteAction}
                itemName={itemToDelete?.name}
                itemType="file"
            />
        </>
    );
}
