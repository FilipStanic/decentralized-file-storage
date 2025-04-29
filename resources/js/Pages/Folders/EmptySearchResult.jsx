import React from 'react';

const EmptySearchResult = ({ searchTerm, currentFolder }) => {
    return (
        <div className="text-center py-8 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg mt-4">
            <p className="text-gray-500 dark:text-gray-400">
                No items matching "{searchTerm}" {currentFolder ? 'in this folder' : 'found'}.
            </p>
        </div>
    );
};

export default EmptySearchResult;
