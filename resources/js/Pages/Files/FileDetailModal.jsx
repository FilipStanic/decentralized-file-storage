import React from 'react';
import { X, Link as LinkIcon, ExternalLink, Database } from 'lucide-react';
import IPFSUploadButton from '@/Pages/IPFS/IPFSUploadButton';

const FileDetailModal = ({ isOpen, onClose, file }) => {
    if (!isOpen || !file) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium dark:text-white">File Details</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Name</h4>
                        <p className="text-gray-900 dark:text-white">{file.name}</p>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Type</h4>
                        <p className="text-gray-900 dark:text-white">{file.type}</p>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Size</h4>
                        <p className="text-gray-900 dark:text-white">{file.size}</p>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Last Modified</h4>
                        <p className="text-gray-900 dark:text-white">{file.lastModified}</p>
                    </div>

                    {file.folder_name && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Folder</h4>
                            <p className="text-gray-900 dark:text-white">{file.folder_name}</p>
                        </div>
                    )}

                    <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">IPFS Status</h4>
                        {file.ipfs_hash ? (
                            <div className="flex items-center text-blue-600 dark:text-blue-400 mb-2">
                                <Database size={16} className="mr-1" />
                                <span>Stored on IPFS</span>
                            </div>
                        ) : (
                            <p className="text-gray-600 dark:text-gray-400 mb-2">Not stored on IPFS</p>
                        )}
                        <IPFSUploadButton
                            fileId={file.id}
                            isOnIPFS={!!file.ipfs_hash}
                        />
                    </div>

                    {file.ipfs_hash && (
                        <>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">IPFS Hash</h4>
                                <div className="flex items-center">
                                    <p className="text-gray-900 dark:text-white truncate mr-2 font-mono text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded">{file.ipfs_hash}</p>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(file.ipfs_hash)}
                                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800"
                                        title="Copy IPFS hash"
                                    >
                                        <LinkIcon size={16} />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">IPFS Gateway</h4>
                                <div className="flex items-center">
                                    <a
                                        href={file.ipfs_url || `https://gateway.pinata.cloud/ipfs/${file.ipfs_hash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 hover:underline flex items-center"
                                    >
                                        View on IPFS Gateway <ExternalLink size={16} className="ml-1" />
                                    </a>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-6">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FileDetailModal;
