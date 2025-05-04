import React from 'react';
import FolderItem from '@/Pages/Folders/FolderItem';
import { useMultiSelect } from '@/Pages/MultiSelectProvider';

const FolderSection = ({ filteredFolders, isSearching, onRenameClick }) => {
    const { isSelectionMode } = useMultiSelect();

    
    const gridClasses = isSelectionMode
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
        : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4';

    if (filteredFolders.length === 0) {
        return null;
    }

    return (
        <div className="mb-8">
            <h2 className="text-lg font-medium mb-4 dark:text-white flex items-center">
                {isSearching ? 'Folders Found' : 'Folders'}
                {isSelectionMode && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                        Selection mode
                    </span>
                )}
            </h2>
            <div className={gridClasses}>
                {filteredFolders.map((folder) => (
                    <FolderItem
                        key={folder.id}
                        folder={folder}
                        onRenameClick={onRenameClick}
                    />
                ))}
            </div>
        </div>
    );
};

export default FolderSection;