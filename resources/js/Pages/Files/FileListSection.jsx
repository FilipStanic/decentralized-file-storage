import React from 'react';
import FileListItem from '@/Pages/Files/FileListItem';
import { useMultiSelect } from '@/Pages/MultiSelectProvider.jsx';

const FileListSection = ({
    filteredFiles,
    isSearching,
    searchTerm,
    currentFolder,
    handleShowDetails,
    handleFileToggleStar,
    handleDeleteClick,
    handleMoveFile
}) => {
    const { 
        isSelectionMode, 
        selectAllFiles, 
        clearSelection, 
        isFileSelected 
    } = useMultiSelect();

    
    const renderTableHeader = () => (
        <div className="grid grid-cols-12 px-4 py-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300">
            <div className="col-span-5 md:col-span-6 flex items-center gap-2">
                {isSelectionMode && (
                    <input
                        type="checkbox"
                        onChange={() => {
                            const allSelected = filteredFiles.length > 0 && 
                                filteredFiles.every(file => isFileSelected(file.id));
                            
                            if (allSelected) {
                                clearSelection();
                            } else {
                                selectAllFiles(filteredFiles);
                            }
                        }}
                        checked={filteredFiles.length > 0 && 
                            filteredFiles.every(file => isFileSelected(file.id))}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                )}
                Name
            </div>
            <div className="col-span-3 md:col-span-2 hidden sm:flex items-center gap-2">Size</div>
            <div className="col-span-2 md:col-span-2 hidden md:flex items-center gap-2">Modified</div>
            <div className="col-span-7 sm:col-span-4 md:col-span-2 flex items-center justify-end gap-2">Actions</div>
        </div>
    );
    

    return (
        <div className="mb-8">
            <h2 className="text-lg font-medium mb-4 dark:text-white">
                {isSearching ? 'Files Found' : 'Files'}
            </h2>
            {filteredFiles.length > 0 ? (
                <div className="border dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
                    {renderTableHeader()}

                    {filteredFiles.map((file) => (
                        <FileListItem
                            key={file.id}
                            file={file}
                            handleShowDetails={handleShowDetails}
                            handleFileToggleStar={handleFileToggleStar}
                            handleDeleteClick={handleDeleteClick}
                            handleMoveFile={handleMoveFile}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg">
                    {isSearching ? (
                        <p className="text-gray-500 dark:text-gray-400">
                            No files matching "{searchTerm}" {currentFolder ? 'in this folder' : ''}.
                        </p>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">
                            No files {currentFolder ? 'in this folder' : ''}. Upload files to see them here.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default FileListSection;