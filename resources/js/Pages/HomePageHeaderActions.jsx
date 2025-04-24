import React from 'react';
import {FilePlus, Plus} from "lucide-react";

export function HomePageHeaderActions({ onCreateNew }) {
    return (
        <div className="flex items-center space-x-2">
            <button
                onClick={() => onCreateNew('file')}
                className="flex items-center justify-center gap-1 px-3 sm:px-4 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm flex-1 md:flex-none"
            >

                <FilePlus size={16} className="hidden sm:block" />
                <span>Upload</span>
            </button>
            <button
                onClick={() => onCreateNew('folder')}
                className="flex items-center justify-center gap-1 px-3 sm:px-4 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white text-sm flex-1 md:flex-none"
            >

                <Plus size={16} className="hidden sm:block" />
                <span>New Folder</span>
            </button>
        </div>
    );
}

export default HomePageHeaderActions;
