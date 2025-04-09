import React from 'react';
import { X, File, FilePlus } from 'lucide-react';

export const UploadModal = ({
                                isOpen,
                                onClose,
                                file,
                                dragActive,
                                handleDrag,
                                handleDrop,
                                handleFileUpload,
                                handleFileChange,
                                handleSubmit,
                                fileInputRef,
                                processing,
                                errors,
                                progress,
                                folderId
                            }) => {
    if (!isOpen) return null;

    const submitWithFolder = (e) => {
        e.preventDefault();


        const formData = new FormData();
        formData.append('file', file);
        if (folderId) {
            formData.append('folder_id', folderId);
        }

        handleSubmit(e);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4"
            >
                <div className="flex justify-between items-center border-b dark:border-gray-700 px-6 py-4">
                    <h3 className="text-lg font-medium dark:text-white">Upload File</h3>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={submitWithFolder}>
                    <div className="px-6 py-4">
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center ${
                                dragActive
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                    : 'border-gray-300 dark:border-gray-600'
                            }`}
                            onDragEnter={handleDrag}
                            onDragOver={handleDrag}
                            onDragLeave={handleDrag}
                            onDrop={handleDrop}
                        >
                            {file ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-3">
                                        <File size={24} className="text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                                        <FilePlus size={24} className="text-gray-500 dark:text-gray-400" />
                                    </div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        Drop your file here, or <button type="button" onClick={handleFileUpload} className="text-indigo-600 dark:text-indigo-400">browse</button>
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Maximum file size: 100MB</p>
                                </div>
                            )}
                        </div>

                        {errors.file && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.file}</p>}

                        {progress && (
                            <div className="mt-4">
                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    Uploading... {typeof progress === 'number' ? progress : progress.percentage}%
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-indigo-600 h-2 rounded-full"
                                        style={{ width: `${typeof progress === 'number' ? progress : progress.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {folderId && (
                            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    This file will be uploaded to the current folder.
                                </p>
                            </div>
                        )}
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
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!file || processing}
                        >
                            {processing ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadModal;
