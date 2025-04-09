import React from 'react';
import { useForm } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';

const DeleteFolderModal = ({ isOpen, onClose, folder, fileCount = 0 }) => {
    const { delete: destroy, processing } = useForm();

    if (!isOpen || !folder) return null;

    const handleDelete = () => {
        destroy(route('folders.destroy', folder.id), {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="flex justify-between items-center border-b dark:border-gray-700 px-6 py-4">
                    <h3 className="text-lg font-medium dark:text-white">Delete Folder</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="px-6 py-4">
                    {fileCount > 0 ? (
                        <div className="flex items-start mb-4">
                            <div className="mr-3 flex-shrink-0">
                                <AlertTriangle className="h-6 w-6 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-gray-800 dark:text-gray-200 font-medium">
                                    This folder contains {fileCount} {fileCount === 1 ? 'file' : 'files'}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                    Deleting this folder will also delete all files inside it. This action cannot be undone.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Are you sure you want to delete "{folder.name}"? This action cannot be undone.
                        </p>
                    )}

                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md border border-gray-200 dark:border-gray-600 mb-4">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill={folder.color || '#6366F1'}>
                                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium text-gray-800 dark:text-white">{folder.name}</p>
                                {fileCount > 0 && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {fileCount} {fileCount === 1 ? 'file' : 'files'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t dark:border-gray-700 px-6 py-4">
                    <button
                        type="button"
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                        onClick={handleDelete}
                        disabled={processing}
                    >
                        {processing ? 'Deleting...' : 'Delete Folder'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteFolderModal;
