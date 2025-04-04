// resources/js/Pages/Folders/Show.jsx
import React, { useState, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { FolderIcon, ChevronRight, FilePlus, Plus, MoreHorizontal, Download, Star, Trash2, File, FileText, Image } from 'lucide-react';
import Dropdown from '@/Components/Dropdown';
import Sidebar from '@/Pages/Sidebar';
import Header from '@/Pages/Header';


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
                All Files
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

    const isAuthenticated = auth && auth.user;


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

    return (
        <>
            <Head title={currentFolder ? currentFolder.name : 'All Files'} />

            <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                {/* Sidebar */}
                <Sidebar
                    expanded={true}
                    onCreateNew={(type) => {

                    }}
                />

                {/* Main content */}
                <div className="flex-1 p-4 overflow-auto bg-gray-50 dark:bg-gray-900">
                    {/* Header */}
                    <Header
                        isAuthenticated={isAuthenticated}
                        auth={auth}
                    />

                    {/* Breadcrumb */}
                    <FolderBreadcrumb breadcrumbs={breadcrumbs} />

                    {/* Folder title */}
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-semibold dark:text-white">
                            {currentFolder ? currentFolder.name : 'All Files'}
                        </h1>
                        <div className="flex items-center space-x-2">
                            <Link
                                href="#"
                                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                onClick={() => {
                                    // Handle upload in the context of this folder
                                }}
                            >
                                }}
                            >
                                <Plus size={16} />
                                <span>New Folder</span>
                            </Link>
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
                                                <FolderIcon size={24} style={{ color: folder.color }} />
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    // Handle star toggle
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
                                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 py-1 border dark:border-gray-700">
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
        </>
    );
}
