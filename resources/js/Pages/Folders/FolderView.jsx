import React, { useState, useRef, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ChevronRight, FilePlus, Plus, MoreHorizontal, Download, Star, Trash2, File, FileText, Image, FolderIcon, Info } from 'lucide-react';
import axios from 'axios';
import Sidebar from '@/Pages/Shared/Sidebar.jsx';
import Header from '@/Pages/Shared/Header.jsx';
import UploadModal from '@/Pages/UploadModal';
import CreateFolderModal from '@/Pages/Folders/CreateFolderModal.jsx';
import FolderItem from '@/Pages/Folders/FolderItem.jsx';
import { useSearch } from '@/Pages/Context/SearchContext.jsx';
import FileDetailModal from '@/Pages/Files/FileDetailModal.jsx';

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


export default function FolderView({ auth, currentFolder, breadcrumbs, folders, files }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [processingFolder, setProcessingFolder] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const [destinationFolders, setDestinationFolders] = useState([]);
    const [loadingDestinations, setLoadingDestinations] = useState(true);

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
                setDropdownOpen(false);
                setSelectedFileId(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
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
        console.log(`Attempting to move file ID: ${fileId} to folder ID: ${folderId === null ? 'Root' : folderId}`);

        axios.post(route('files.move', fileId), {
            folder_id: folderId
        }).then(() => {
            console.log(`Successfully moved file ${fileId}. Reloading page.`);
            window.location.reload();
        }).catch((error) => {
            console.error('Error moving file:', error);
            if (error.response) {
                console.error('Error Response Data:', error.response.data);
                console.error('Error Response Status:', error.response.status);
                alert(`Error moving file: ${error.response.data.message || 'Please try again.'}`);
            } else if (error.request) {
                console.error('Error Request:', error.request);
                alert('Error moving file: No response from server.');
            } else {
                console.error('Error Message:', error.message);
                alert('Error moving file: Could not send request.');
            }
        }).finally(() => {
            setDropdownOpen(false);
            setSelectedFileId(null);
        });
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
        e.preventDefault(); e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation(); setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setData({ ...data, file: e.dataTransfer.files[0] });
            setShowUploadModal(true);
        }
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (!data.file) return;
        setProcessing(true); setProgress(0);

        const formData = new FormData();
        formData.append('file', data.file);
        if (currentFolder) formData.append('folder_id', currentFolder.id);

        axios.post(route('files.store'), formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: progressEvent => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setProgress(percentCompleted);
            }
        }).then(() => {
            setShowUploadModal(false); setData({ file: null }); setProgress(null);
            window.location.reload();
        }).catch(error => {
            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                console.error("Upload error:", error);
                setErrors({ file: "Upload failed. Please try again." });
            }
        }).finally(() => {
            setProcessing(false);
        });
    };

    const handleCreateFolder = (folderData) => {
        setProcessingFolder(true);
        if (currentFolder) folderData.parent_id = currentFolder.id;

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

    const toggleDropdown = (fileId) => {
        if (selectedFileId === fileId && dropdownOpen) {
            setDropdownOpen(false);
            setSelectedFileId(null);
        } else {
            setSelectedFileId(fileId);
            setDropdownOpen(true);
        }
    };

    const handleShowDetails = (file) => {
        setSelectedFile(file);
        setShowDetailModal(true);
    };

    return (
        <>
            <Head title={currentFolder ? currentFolder.name : 'All Folders'} />

            <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                <Sidebar expanded={true} onCreateNew={(type) => type === 'folder' ? handleNewFolder() : handleUpload()} />

                <div className="flex-1 p-4 overflow-auto bg-gray-50 dark:bg-gray-900">
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
                            <button onClick={handleUpload} className="flex items-center justify-center gap-1 px-3 sm:px-4 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm">
                                <FilePlus size={16} className="hidden sm:block" /><span>Upload</span>
                            </button>
                            <button onClick={handleNewFolder} className="flex items-center justify-center gap-1 px-3 sm:px-4 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white text-sm">
                                <Plus size={16} className="hidden sm:block" /><span>New Folder</span>
                            </button>
                        </div>
                    </div>

                    {filteredFolders.length > 0 && !isSearching && (
                        <div className="mb-8">
                            <h2 className="text-lg font-medium mb-4 dark:text-white">Folders</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {filteredFolders.map((folder) => <FolderItem key={folder.id} folder={folder} />)}
                            </div>
                        </div>
                    )}


                    <div>
                        <h2 className="text-lg font-medium mb-4 dark:text-white">Files</h2>
                        {filteredFiles.length > 0 ? (
                            <div className="border dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
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
                                                <span className="text-xs text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full ml-1">
                                                    IPFS
                                                </span>
                                            )}
                                        </div>
                                        <div className="col-span-3 md:col-span-2 hidden sm:flex items-center text-gray-600 dark:text-gray-400">{file.size}</div>
                                        <div className="col-span-2 md:col-span-2 hidden md:flex items-center text-gray-600 dark:text-gray-400">{file.lastModified}</div>
                                        <div className="col-span-7 sm:col-span-4 md:col-span-2 flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => handleShowDetails(file)}
                                                className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                                title="File Details"
                                            >
                                                <Info size={18} />
                                            </button>
                                            <Link onClick={() => window.location.href = route('files.download', file.id)} className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">
                                                <Download size={18} />
                                            </Link>
                                            <Link as="button" href={route('files.toggle-star', file.id)} method="post" preserveScroll className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded">
                                                <Star size={18} fill={file.starred ? "currentColor" : "none"} className={file.starred ? "text-yellow-400" : ""} />
                                            </Link>
                                            <div className="relative">
                                                <button
                                                    onClick={() => toggleDropdown(file.id)}
                                                    className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                                >
                                                    <MoreHorizontal size={18} />
                                                </button>
                                                {dropdownOpen && selectedFileId === file.id && (
                                                    <div ref={dropdownRef} className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 py-1 border dark:border-gray-700">
                                                        <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 font-medium border-b dark:border-gray-700">Move to folder</div>
                                                        <button onClick={() => handleMoveFile(file.id, null)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                            Root folder
                                                        </button>
                                                        {loadingDestinations ? (
                                                            <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                                                        ) : (
                                                            destinationFolders.map(folder => (
                                                                <button key={folder.id} onClick={() => handleMoveFile(file.id, folder.id)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                                    {folder.name}
                                                                </button>
                                                            ))
                                                        )}
                                                        <div className="border-t dark:border-gray-700 my-1"></div>
                                                        <Link href={route('files.destroy', file.id)} method="delete" as="button" preserveScroll className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700">
                                                            Delete
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                            <Link href={route('files.destroy', file.id)} method="delete" as="button" preserveScroll className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                                                <Trash2 size={18} />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg">
                                {isSearching ? (
                                    <p className="text-gray-500 dark:text-gray-400">No files matching "{searchTerm}" in this folder.</p>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">No files in this folder. Upload files to see them here.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

            <UploadModal
                isOpen={showUploadModal}
                onClose={() => { setShowUploadModal(false); setData({ file: null }); setProgress(null); setErrors({}); }}
                file={data.file}
                dragActive={dragActive} handleDrag={handleDrag} handleDrop={handleDrop}
                handleFileUpload={handleFileUpload} handleFileChange={handleFileChange}
                handleSubmit={handleSubmit} fileInputRef={fileInputRef}
                processing={processing} errors={errors} progress={progress}
                folderId={currentFolder ? currentFolder.id : null}
            />
            <CreateFolderModal
                isOpen={showFolderModal}
                onClose={() => setShowFolderModal(false)}
                onSubmit={handleCreateFolder}
                processing={processingFolder}
                parentId={currentFolder ? currentFolder.id : null}
            />
            <FileDetailModal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                file={selectedFile}
            />
        </>
    );
}
