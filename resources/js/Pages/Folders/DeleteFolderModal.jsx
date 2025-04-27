import React from 'react';
import { router } from '@inertiajs/react';
import { X, AlertTriangle } from 'lucide-react';

const DeleteFolderModal = ({ isOpen, onClose, folder, onDeleteStart, onDeleteComplete }) => {
    if (!isOpen || !folder) return null;

    const handleDelete = () => {
        if (typeof onDeleteStart === 'function') {
            onDeleteStart();
        }

        router.delete(route('folders.destroy', folder.id), {
            onSuccess: () => {
                onClose();
                if (typeof onDeleteComplete === 'function') {
                    onDeleteComplete();
                }
                router.reload({ only: ['sharedSidebarFolders'] });
            },
            onError: (errors) => {
                console.error('Error deleting folder:', errors);
                if (typeof onDeleteComplete === 'function') {
                    onDeleteComplete();
                }
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-auto">
                <div className="flex justify-between items-center border-b dark:border-gray-700 px-6 py-4">
                    <h3 className="text-lg font-medium dark:text-white flex items-center">
                        <AlertTriangle size={20} className="text-red-500 mr-2" />
                        Delete Folder
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="px-6 py-6">
                    <p className="text-gray-700 dark:text-gray-300 text-center">
                        Are you sure you want to delete the folder
                        <strong className="dark:text-white mx-1">{folder.name}</strong>?
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                        It will be moved to the trash along with all its contents.
                    </p>
                </div>

                <div className="flex items-center justify-end gap-3 border-t dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
                    <button
                        type="button"
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                        onClick={handleDelete}
                    >
                        Move to Trash
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteFolderModal;
