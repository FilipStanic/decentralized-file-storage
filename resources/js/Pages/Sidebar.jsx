import React from 'react';
import { Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';

export const Sidebar = ({expanded,onCreateNew}) => {
    return (
        <div className="w-60 border-r dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800">
            <Link href={route('home')} className="p-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white">B</span>
                </div>
                <h1 className="font-bold text-lg dark:text-white">BlockStore</h1>
            </Link>

            <div className="px-4 py-2">
                <button
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md w-full"
                    onClick={onCreateNew}
                >
                    <Plus size={16} />
                    <span>Upload File</span>
                </button>
            </div>

            <div className="mt-4">
                <h2 className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">Files</h2>
                <div className="px-4 py-1 flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                    <span className="text-gray-800 dark:text-gray-200">My files</span>
                </div>

                {expanded && (
                    <>
                        <div className="px-4 py-1 pl-8 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer">
                            Analytics
                        </div>
                        <div className="px-4 py-1 pl-8 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer">
                            Assets
                        </div>
                        <div className="px-4 py-1 pl-8 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer">
                            Encrypted
                        </div>
                    </>
                )}
            </div>

            <div className="mt-auto p-4 border-t dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">0 GB of 50 GB used</div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full w-0"></div>
                </div>
                <button className="text-indigo-600 dark:text-indigo-400 text-sm mt-2">Upgrade</button>
            </div>
        </div>
    );
};

export default Sidebar;
