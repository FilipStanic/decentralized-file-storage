import React from 'react';
import { Download, Star, Trash2, MoreHorizontal, Info, CheckSquare, Square, File, FileText, Image } from 'lucide-react';
import { useMultiSelect } from '@/Pages/MultiSelectProvider.jsx';
import { useDragDrop } from '@/Pages/DragDropService.jsx';

const getFileIcon = (type) => {
    switch (type) {
        case 'Image': return <Image className="text-green-500" />;
        case 'PDF': return <FileText className="text-red-500" />;
        case 'Spreadsheet': return <FileText className="text-emerald-500" />;
        case 'Presentation': return <FileText className="text-orange-500" />;
        case 'Document': return <FileText className="text-blue-500" />;
        default: return <File className="text-gray-500" />;
    }
};

const FileListItem = ({
                          file,
                          dropdownOpen,
                          toggleDropdown,
                          handleShowDetails,
                          handleFileToggleStar,
                          handleDeleteClick,
                          handleMoveFile,
                          loadingDestinations,
                          destinationFolders,
                          dropdownRef
                      }) => {
    const { isSelectionMode, toggleFileSelection, isFileSelected } = useMultiSelect();
    const { startDraggingFile } = useDragDrop();
    const isSelected = isFileSelected(file.id);

    return (
        <div
            key={file.id}
            className={`grid grid-cols-12 px-4 py-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm items-center
                ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
            draggable={!isSelectionMode}
            onDragStart={(e) => startDraggingFile(file, e)}
            onClick={isSelectionMode ? () => toggleFileSelection(file) : undefined}
        >
            <div className="col-span-5 md:col-span-6 flex items-center gap-2 overflow-hidden">
                {isSelectionMode && (
                    <div className="flex-shrink-0">
                        {isSelected ? (
                            <CheckSquare size={18} className="text-indigo-600 dark:text-indigo-400" />
                        ) : (
                            <Square size={18} className="text-gray-400" />
                        )}
                    </div>
                )}
                <div className="flex-shrink-0">{getFileIcon(file.type)}</div>
                <span className="truncate dark:text-white">{file.name}</span>
                {file.ipfs_hash && (
                    <span className="text-xs text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full ml-1 whitespace-nowrap">
                        IPFS
                    </span>
                )}
            </div>
            <div className="col-span-3 md:col-span-2 hidden sm:flex items-center text-gray-600 dark:text-gray-400">
                {file.size}
            </div>
            <div className="col-span-2 md:col-span-2 hidden md:flex items-center text-gray-600 dark:text-gray-400">
                {file.lastModified}
            </div>
            <div className="col-span-7 sm:col-span-4 md:col-span-2 flex items-center justify-end gap-1 flex-wrap py-1">
                <button
                    onClick={() => handleShowDetails(file)}
                    className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                    title="File Details"
                >
                    <Info size={18} />
                </button>
                <a
                    href={route('files.download', file.id)}
                    className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                    title="Download"
                >
                    <Download size={18} />
                </a>
                <button
                    onClick={(e) => handleFileToggleStar(e, file.id)}
                    className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded"
                    title={file.starred ? "Unstar" : "Star"}
                >
                    <Star
                        size={18}
                        fill={file.starred ? "currentColor" : "none"}
                        className={file.starred ? "text-yellow-400" : ""}
                    />
                </button>
                <div className="relative">
                    <button
                        onClick={() => toggleDropdown(file.id)}
                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="More options"
                    >
                        <MoreHorizontal size={18} />
                    </button>
                    {dropdownOpen === file.id && (
                        <div
                            ref={dropdownRef}
                            className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 py-1 border dark:border-gray-700 max-h-60 overflow-y-auto"
                        >
                            <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 font-medium border-b dark:border-gray-700">
                                Move to folder
                            </div>
                            {loadingDestinations ? (
                                <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                            ) : (
                                <>
                                    {destinationFolders.map(folder => (
                                        <button
                                            key={folder.id}
                                            onClick={() => handleMoveFile(file.id, folder.id)}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            {folder.full_path}
                                        </button>
                                    ))}
                                    {destinationFolders.length === 0 && (
                                        <div className="px-4 py-2 text-sm text-gray-500">No available folders to move to</div>
                                    )}
                                </>
                            )}
                            <div className="border-t dark:border-gray-700 my-1"></div>
                            <button
                                type="button"
                                onClick={(e) => handleDeleteClick(e, file)}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>
                <button
                    type="button"
                    onClick={(e) => handleDeleteClick(e, file)}
                    className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    title="Delete"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

export default FileListItem;
