import React, { useState, useEffect } from 'react';
import { FolderIcon, X } from 'lucide-react';
import { router } from '@inertiajs/core'; // Or useForm if you prefer

const RenameFolderModal = ({ isOpen, onClose, folder }) => {
    const [folderName, setFolderName] = useState('');
    const [folderColor, setFolderColor] = useState('');
    const [processing, setProcessing] = useState(false);

    const colors = [
        '#6366F1', '#EF4444', '#F59E0B', '#10B981',
        '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280',
    ];

    // Initialize state when the modal opens or the folder prop changes
    useEffect(() => {
        if (isOpen && folder) {
            setFolderName(folder.name || '');
            setFolderColor(folder.color || '#6366F1'); // Default color if none exists
        } else if (!isOpen) {
            setFolderName(''); // Reset on close
            setFolderColor('');
        }
    }, [isOpen, folder]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!folder || !folderName.trim()) return;

        setProcessing(true);

        // Use router.put or router.patch for updates
        router.put(route('folders.update', folder.id), { // Assuming you have a folders.update route
            name: folderName,
            color: folderColor,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                onClose(); // Close modal on success
            },
            onError: (errors) => {
                console.error('Error renaming folder:', errors);
                // Optionally display errors to the user
                 alert('Failed to rename folder. Please check the name and try again.');
            },
            onFinish: () => {
                setProcessing(false);
            }
        });
    };

    if (!isOpen || !folder) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-auto">
                <div className="flex justify-between items-center border-b dark:border-gray-700 px-6 py-4">
                    <h3 className="text-lg font-medium dark:text-white">Rename Folder</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="px-6 py-4">
                        <div className="mb-4">
                            <label htmlFor="folderName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Folder Name
                            </label>
                            <input
                                id="folderName"
                                type="text"
                                value={folderName}
                                onChange={(e) => setFolderName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Folder Name"
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Folder Color
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {colors.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setFolderColor(color)}
                                        className={`w-8 h-8 rounded-full ${folderColor === color ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-gray-800' : ''}`}
                                        style={{ backgroundColor: color }}
                                        aria-label={`Select color ${color}`}
                                    />
                                ))}
                            </div>

                            <div className="flex items-center mt-4">
                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                                    <FolderIcon size={24} style={{ color: folderColor }} />
                                </div>
                                <span className="text-gray-700 dark:text-gray-300">Preview</span>
                            </div>
                        </div>
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
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                            disabled={!folderName.trim() || processing}
                        >
                            {processing ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RenameFolderModal;