import React from 'react';
import FolderItem from '@/Pages/Folders/FolderItem';

const FolderSection = ({ filteredFolders, isSearching, onRenameClick }) => {
    return (
        filteredFolders.length > 0 && (
            <div className="mb-8">
                <h2 className="text-lg font-medium mb-4 dark:text-white">
                    {isSearching ? 'Folders Found' : 'Folders'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredFolders.map((folder) => (
                        <FolderItem
                            key={folder.id}
                            folder={folder}
                            onRenameClick={onRenameClick}
                        />
                    ))}
                </div>
            </div>
        )
    );
};

export default FolderSection;
