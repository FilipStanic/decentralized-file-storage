import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Plus, FolderIcon, Clock, Star, Trash2, Archive, Settings, ChevronDown, ChevronRight } from 'lucide-react';
import axios from 'axios';

export const Sidebar = ({ expanded, onCreateNew }) => {
    const { auth } = usePage().props;
    const [folders, setFolders] = useState([]);
    const [recentFolders, setRecentFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [folderSectionOpen, setFolderSectionOpen] = useState(true);
    const [recentSectionOpen, setRecentSectionOpen] = useState(true);

    useEffect(() => {
        if (auth.user) {
            // Fetch sidebar data
            axios.get(route('sidebar.data'))
                .then(response => {
                    setFolders(response.data.rootFolders);
                    setRecentFolders(response.data.recentFolders);
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching sidebar data:', error);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [auth.user]);

    const toggleFolderSection = () => {
        setFolderSectionOpen(!folderSectionOpen);
    };

    const toggleRecentSection = () => {
        setRecentSectionOpen(!recentSectionOpen);
    };

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

            <div className="mt-2 flex-1 overflow-y-auto">
                <div className="mb-4">
                    <Link
                        href={route('home')}
                        className="px-4 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                        <FolderIcon size={18} className="text-indigo-500" />
                        <span className="text-gray-800 dark:text-gray-200">All Files</span>
                    </Link>

                    <Link
                        href="#"
                        className="px-4 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                        <Star size={18} className="text-yellow-500" />
                        <span className="text-gray-800 dark:text-gray-200">Starred</span>
                    </Link>

                    <Link
                        href="#"
                        className="px-4 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                        <Clock size={18} className="text-green-500" />
                        <span className="text-gray-800 dark:text-gray-200">Recent</span>
                    </Link>
                </div>

                {/* Folders Section */}
                <div className="mb-2">
                    <div
                        className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                        onClick={toggleFolderSection}
                    >
                        <span className="text-gray-700 dark:text-gray-300 font-medium">Folders</span>
                        {folderSectionOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>

                    {folderSectionOpen && (
                        <div className="mt-1">
                            {loading ? (
                                <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm">
                                    Loading folders...
                                </div>
                            ) : folders.length > 0 ? (
                                folders.map(folder => (
                                    <Link
                                        key={folder.id}
                                        href={route('folders.show', folder.id)}
                                        className="px-4 py-2 pl-8 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                                    >
                                        <FolderIcon size={16} style={{ color: folder.color }} />
                                        <span className="text-gray-700 dark:text-gray-300 truncate">{folder.name}</span>
                                    </Link>
                                ))
                            ) : (
                                <div className="px-4 py-2 pl-8 text-gray-500 dark:text-gray-400 text-sm">
                                    No folders yet
                                </div>
                            )}

                            <button
                                className="px-4 py-2 pl-8 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md w-full text-left"
                                onClick={() => onCreateNew('folder')}
                            >
                                <Plus size={16} />
                                <span>New Folder</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Recent Folders Section */}
                {recentFolders.length > 0 && (
                    <div className="mb-2">
                        <div
                            className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                            onClick={toggleRecentSection}
                        >
                            <span className="text-gray-700 dark:text-gray-300 font-medium">Recent Folders</span>
                            {recentSectionOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </div>

                        {recentSectionOpen && (
                            <div className="mt-1">
                                {recentFolders.map(folder => (
                                    <Link
                                        key={folder.id}
                                        href={route('folders.show', folder.id)}
                                        className="px-4 py-2 pl-8 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                                    >
                                        <FolderIcon size={16} style={{ color: folder.color }} />
                                        <span className="text-gray-700 dark:text-gray-300 truncate">{folder.name}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Additional links */}
                <div className="mt-2">
                    <Link
                        href="#"
                        className="px-4 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                        <Trash2 size={18} className="text-gray-500" />
                        <span className="text-gray-800 dark:text-gray-200">Trash</span>
                    </Link>

                    <Link
                        href="#"
                        className="px-4 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                        <Archive size={18} className="text-gray-500" />
                        <span className="text-gray-800 dark:text-gray-200">Archive</span>
                    </Link>

                    <Link
                        href={route('profile.edit')}
                        className="px-4 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                        <Settings size={18} className="text-gray-500" />
                        <span className="text-gray-800 dark:text-gray-200">Settings</span>
                    </Link>
                </div>
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
