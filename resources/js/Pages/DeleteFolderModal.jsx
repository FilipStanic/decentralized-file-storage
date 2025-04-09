import React from 'react';
import { useForm } from '@inertiajs/react';

const DeleteFolderModal = ({ isOpen, onClose, folder }) => {
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                <h3 className="text-lg font-medium dark:text-white mb-4">Delete Folder</h3>

                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Are you sure you want to delete "{folder.name}"?
                </p>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        onClick={handleDelete}
                        disabled={processing}
                    >
                        {processing ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteFolderModal;
