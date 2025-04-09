import React, { useState, useRef, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Download, Star, Trash2, File, FileText, Image, MoreHorizontal } from 'lucide-react';
import axios from 'axios';

const getFileIcon = (type) => {
    const icons = {
        'Image': <Image className="text-green-500" />,
        'PDF': <FileText className="text-red-500" />,
        'Spreadsheet': <FileText className="text-emerald-500" />,
        'Presentation': <FileText className="text-orange-500" />,
        'Document': <FileText className="text-blue-500" />
    };
    return icons[type] || <File className="text-gray-500" />;
};

export const RecentFiles = ({ recentFiles }) => {
    const [folders, setFolders] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdown(null);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        axios.get(route('sidebar.data'))
            .then(response => {
                setFolders(response.data.rootFolders);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching folders:', error);
                setLoading(false);
            });
    }, []);

    const handleMoveFile = (fileId, folderId) => {
        axios.post(route('files.move', fileId), {
            folder_id: folderId
        }).then(() => {
            window.location.reload();
        }).catch(error => console.error('Error moving file:', error));
        setOpenDropdown(null);
    };

    if (!recentFiles.length) {
        return (
            <div>
                <h2 className="text-lg font-medium dark:text-white mb-4">Recent</h2>
                <div className="text-center py-8 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">No recent files. Upload files to see them here.</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-lg font-medium dark:text-white mb-4">Recent</h2>
            <div className="border dark:border-gray-700 rounded-md overflow-hidden bg-white dark:bg-gray-800">
                <div className="grid grid-cols-12 px-4 py-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300">
                    <div className="col-span-5 md:col-span-6">Name</div>
                    <div className="col-span-3 md:col-span-2 hidden sm:block">Size</div>
                    <div className="col-span-2 md:col-span-2 hidden md:block">Modified</div>
                    <div className="col-span-7 sm:col-span-4 md:col-span-2 text-right">Actions</div>
                </div>

                {recentFiles.map((file) => (
                    <div key={file.id} className="grid grid-cols-12 px-4 py-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                        <div className="col-span-5 md:col-span-6 flex items-center gap-2">
                            {getFileIcon(file.type)}
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
                        <div className="col-span-7 sm:col-span-4 md:col-span-2 flex items-center justify-end gap-1">
                            <Link
                                onClick={() => window.location.href = route('files.download', file.id)}
                                className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                            >
                                <Download size={18} />
                            </Link>
                            <Link
                                as="button"
                                href={route('files.toggle-star', file.id)}
                                method="post"
                                className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 rounded"
                            >
                                <Star
                                    size={18}
                                    fill={file.starred ? "currentColor" : "none"}
                                    className={file.starred ? "text-yellow-400" : ""}
                                />
                            </Link>

                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setOpenDropdown(prev => prev === file.id ? null : file.id)}
                                    className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded"
                                >
                                    <MoreHorizontal size={18} />
                                </button>

                                {openDropdown === file.id && (
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
                                        {loading ? (
                                            <div className="px-4 py-2 text-sm text-gray-500">Loading folders...</div>
                                        ) : (
                                            folders.map(folder => (
                                                <button
                                                    key={folder.id}
                                                    onClick={() => handleMoveFile(file.id, folder.id)}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    {folder.name}
                                                </button>
                                            ))
                                        )}
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
                                className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"
                            >
                                <Trash2 size={18} />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentFiles;
