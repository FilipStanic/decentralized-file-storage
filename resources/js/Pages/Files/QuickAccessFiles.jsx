import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Star, File, FileText, Image, FilePlus, FolderIcon, Info } from 'lucide-react';
import FileDetailModal from './FileDetailModal';
import IPFSStatus from '@/Pages/IPFS/IPFSStatus';

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

export const QuickAccessFiles = ({ quickAccessFiles }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const reversedFiles = [...quickAccessFiles].reverse();

    const handleShowDetails = (file) => {
        setSelectedFile(file);
        setShowDetailModal(true);
    };

    return (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium dark:text-white">Quick access</h2>
            </div>

            {quickAccessFiles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {reversedFiles.map((file) => (
                        <div
                            key={`${file.type}-${file.id}`}
                            className="p-4 border dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow flex flex-col bg-white dark:bg-gray-800"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                    {file.type === 'folder' ?
                                        <FolderIcon size={24} style={{ color: file.color || '#6366F1' }} /> :
                                        getFileIcon(file.type)
                                    }
                                </div>
                                <div className="flex items-center space-x-1">
                                    {file.type !== 'folder' && (
                                        <button
                                            onClick={() => handleShowDetails(file)}
                                            className="text-gray-400 hover:text-blue-600 p-1"
                                            title="File Details"
                                        >
                                            <Info size={18} />
                                        </button>
                                    )}
                                    <Link
                                        as="button"
                                        href={file.type === 'folder' ? route('folders.toggle-star', file.id) : route('files.toggle-star', file.id)}
                                        method="post"
                                        className="text-gray-400 hover:text-yellow-400 p-1"
                                    >
                                        <Star
                                            size={18}
                                            fill={file.starred ? "currentColor" : "none"}
                                            className={file.starred ? "text-yellow-400" : ""}
                                        />
                                    </Link>
                                </div>
                            </div>
                            <h3 className="font-medium text-gray-900 dark:text-white mb-1 truncate">{file.name}</h3>
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500 dark:text-gray-400">{file.date}</p>
                                {file.ipfs_hash && <IPFSStatus isOnIPFS={true} />}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">No quick access files yet. Files you use frequently will appear here.</p>
                </div>
            )}

            <FileDetailModal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                file={selectedFile}
            />
        </div>
    );
};

export default QuickAccessFiles;
