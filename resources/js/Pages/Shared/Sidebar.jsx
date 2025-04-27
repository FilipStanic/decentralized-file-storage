import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Plus, FolderIcon, Clock, Star, Trash2, Settings, ChevronDown, ChevronRight, Menu, X, Database } from 'lucide-react';
import StorageIndicator from '@/Pages/StorageIndicator';

export const Sidebar = ({ expanded, onCreateNew }) => {
    const { sharedSidebarFolders = [] } = usePage().props;
    const [folderSectionOpen, setFolderSectionOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);

    
    useEffect(() => {
        const savedState = localStorage.getItem('folderSectionOpen');
        if (savedState !== null) {
            setFolderSectionOpen(savedState === 'true');
        }
    }, []);

    
    const isCurrentRoute = (routeName) => {
        return route().current(routeName);
    };

    const toggleFolderSection = () => {
        const newState = !folderSectionOpen;
        setFolderSectionOpen(newState);
        
        localStorage.setItem('folderSectionOpen', newState.toString());
    };

    const toggleMobileSidebar = () => {
        setMobileOpen(!mobileOpen);
    };

    const sidebarContent = (
        <>
            <div className="p-4 flex items-center justify-between">
                <Link href={route('home')} className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">B</span>
                    </div>
                    <h1 className="font-bold text-base dark:text-white">BlockStore</h1>
                </Link>
                <button
                    onClick={() => setMobileOpen(false)}
                    className="lg:hidden text-gray-500 hover:text-gray-700"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="px-4 py-2">
                <button
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md w-full"
                    onClick={() => {
                        onCreateNew('file');
                        setMobileOpen(false);
                    }}
                >
                    <Plus size={16} />
                    <span>Upload File</span>
                </button>
            </div>

            <div className="mt-2 flex-1 overflow-y-auto">
                <div className="mb-4">
                    <Link
                        href={route('home')}
                        className={`px-4 py-2 flex items-center gap-2 rounded-md ${
                            isCurrentRoute('home')
                                ? 'bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}
                        onClick={() => setMobileOpen(false)}
                    >
                        <FolderIcon size={18} className="text-indigo-500" />
                        <span>All Files</span>
                    </Link>
                    <Link
                        href={route('folders.show')}
                        className={`px-4 py-2 flex items-center gap-2 rounded-md ${
                            isCurrentRoute('folders.show') && !route().params.id
                                ? 'bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}
                        onClick={() => setMobileOpen(false)}
                    >
                        <FolderIcon size={18} className="text-blue-500" />
                        <span>All Folders</span>
                    </Link>
                    <Link
                        href={route('starred.index')}
                        className={`px-4 py-2 flex items-center gap-2 rounded-md ${
                            isCurrentRoute('starred.index')
                                ? 'bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}
                        onClick={() => setMobileOpen(false)}
                    >
                        <Star size={18} className="text-yellow-500" />
                        <span>Starred</span>
                    </Link>
                    <Link
                        href={route('ipfs.index')}
                        className={`px-4 py-2 flex items-center gap-2 rounded-md ${
                            isCurrentRoute('ipfs.index')
                                ? 'bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}
                        onClick={() => setMobileOpen(false)}
                    >
                        <Database size={18} className="text-blue-500" />
                        <span>IPFS</span>
                    </Link>
                </div>

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
                            {sharedSidebarFolders.map(folder => (
                                <Link
                                    key={folder.id}
                                    href={route('folders.show', folder.id)}
                                    className={`px-4 py-2 pl-8 flex items-center gap-2 rounded-md ${
                                        isCurrentRoute('folders.show') && route().params.id == folder.id
                                            ? 'bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                    }`}
                                    preserveScroll={true}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <FolderIcon size={16} style={{ color: folder.color || '#6366F1' }} />
                                    <span className="truncate">{folder.name}</span>
                                </Link>
                            ))}
                            <button
                                className="px-4 py-2 pl-8 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md w-full text-left"
                                onClick={() => {
                                    onCreateNew('folder');
                                    setMobileOpen(false);
                                }}
                            >
                                <Plus size={16} />
                                <span>New Folder</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-2">
                    <Link
                        href={route('trash.index')}
                        className={`px-4 py-2 flex items-center gap-2 rounded-md ${
                            isCurrentRoute('trash.index')
                                ? 'bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}
                        onClick={() => setMobileOpen(false)}
                    >
                        <Trash2 size={18} className="text-gray-500" />
                        <span>Trash</span>
                    </Link>
                    <Link
                        href={route('profile.edit')}
                        className={`px-4 py-2 flex items-center gap-2 rounded-md ${
                            isCurrentRoute('profile.edit')
                                ? 'bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}
                        onClick={() => setMobileOpen(false)}
                    >
                        <Settings size={18} className="text-gray-500" />
                        <span>Settings</span>
                    </Link>
                </div>
            </div>

            <StorageIndicator />
        </>
    );

    return (
        <>
            <div className="fixed top-2.5 left-3 z-40 lg:hidden">
                <button
                    onClick={toggleMobileSidebar}
                    className="p-1.5 bg-white dark:bg-gray-800 rounded-md shadow-md"
                >
                    <Menu size={16} />
                </button>
            </div>
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-200 ${
                    mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setMobileOpen(false)}
            ></div>
            <div
                className={`fixed top-0 left-0 h-full z-40 lg:static lg:h-screen w-64 lg:w-60 border-r dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800 transform transition-transform duration-200 ease-in-out ${
                    mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                {sidebarContent}
            </div>
        </>
    );
};

export default Sidebar;
