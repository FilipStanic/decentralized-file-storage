import React from 'react';
import { Link } from '@inertiajs/react';
import { Download, Star, Trash2, File, FileText, Image } from 'lucide-react';

// Reusable function to get file icon
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

export const RecentFiles = ({ recentFiles }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium dark:text-white">Recent</h2>
            </div>

            {recentFiles.length > 0 ? (
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

                    {recentFiles.map((file) => (
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
                    <p className="text-gray-500 dark:text-gray-400">No files yet. Upload files to see them here.</p>
                </div>
            )}
        </div>
    );
};

export default RecentFiles;
