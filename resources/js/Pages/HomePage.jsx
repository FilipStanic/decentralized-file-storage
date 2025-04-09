import React, { useState, useRef, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import axios from 'axios';

import Sidebar from './Sidebar';
import Header from './Header';
import QuickAccessFiles from './QuickAccessFiles';
import RecentFiles from './RecentFiles';
import UploadModal from './UploadModal';
import WelcomeSection from './WelcomeSection';
import CreateFolderModal from './CreateFolderModal';

export const HomePage = ({ auth, recentFiles = [], quickAccessFiles = [] }) => {
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredRecentFiles, setFilteredRecentFiles] = useState(recentFiles);
    const [filteredQuickAccessFiles, setFilteredQuickAccessFiles] = useState(quickAccessFiles);

    const fileInputRef = useRef(null);
    const isAuthenticated = auth && auth.user;

    const { data, setData, post, processing, progress, errors, reset } = useForm({
        file: null,
    });

    useEffect(() => {
        setFilteredRecentFiles(recentFiles);
        setFilteredQuickAccessFiles(quickAccessFiles);
    }, [recentFiles, quickAccessFiles]);

    const handleCreateNew = (type = 'file') => {
        if (type === 'folder') {
            setShowFolderModal(true);
        } else {
            setShowUploadModal(true);
        }
    };

    const handleFileUpload = () => fileInputRef.current.click();

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setData('file', e.target.files[0]);
        }
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (!data.file) return;

        post(route('files.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setShowUploadModal(false);
                reset();
            },
        });
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === 'dragenter' || e.type === 'dragover');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setData('file', e.dataTransfer.files[0]);
        }
    };

    const handleSearch = (term) => {
        setSearchTerm(term);

        if (!term.trim()) {
            setFilteredRecentFiles(recentFiles);
            setFilteredQuickAccessFiles(quickAccessFiles);
            return;
        }

        const termLower = term.toLowerCase();
        setFilteredRecentFiles(recentFiles.filter(file =>
            file.name.toLowerCase().includes(termLower)));
        setFilteredQuickAccessFiles(quickAccessFiles.filter(file =>
            file.name.toLowerCase().includes(termLower)));
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 relative">
            <Sidebar onCreateNew={handleCreateNew} />

            <div className="flex-1 p-4 pt-12 lg:pt-4 overflow-auto bg-gray-50 dark:bg-gray-900">
                <Header
                    isAuthenticated={isAuthenticated}
                    auth={auth}
                    onSearch={handleSearch}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                />

                {isAuthenticated ? (
                    (quickAccessFiles.length === 0 && recentFiles.length === 0) ? (
                        <WelcomeSection
                            isAuthenticated={true}
                            file={data.file}
                            dragActive={dragActive}
                            handleDrag={handleDrag}
                            handleDrop={handleDrop}
                            handleFileUpload={handleFileUpload}
                            fileInputRef={fileInputRef}
                            onUpload={handleSubmit}
                        />
                    ) : (
                        <>
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 md:mb-0">
                                    {searchTerm ? 'Search Results' : 'My Files'}
                                </h2>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleCreateNew('file')}
                                        className="px-3 sm:px-4 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                                    >
                                        Upload
                                    </button>
                                    <button
                                        onClick={() => handleCreateNew('folder')}
                                        className="px-3 sm:px-4 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white text-sm"
                                    >
                                        New Folder
                                    </button>
                                </div>
                            </div>

                            {filteredQuickAccessFiles.length > 0 && <QuickAccessFiles quickAccessFiles={filteredQuickAccessFiles} />}
                            {filteredRecentFiles.length > 0 && <RecentFiles recentFiles={filteredRecentFiles} />}

                            {searchTerm && filteredQuickAccessFiles.length === 0 && filteredRecentFiles.length === 0 && (
                                <div className="text-center py-10 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No results found</h3>
                                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                                        We couldn't find any files or folders matching "{searchTerm}"
                                    </p>
                                </div>
                            )}
                        </>
                    )
                ) : (
                    <WelcomeSection isAuthenticated={false} />
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />

            <UploadModal
                isOpen={showUploadModal}
                onClose={() => {
                    setShowUploadModal(false);
                    reset();
                }}
                file={data.file}
                dragActive={dragActive}
                handleDrag={handleDrag}
                handleDrop={handleDrop}
                handleFileUpload={handleFileUpload}
                handleFileChange={handleFileChange}
                handleSubmit={handleSubmit}
                fileInputRef={fileInputRef}
                processing={processing}
                errors={errors}
                progress={progress}
            />

            <CreateFolderModal
                isOpen={showFolderModal}
                onClose={() => setShowFolderModal(false)}
                onSubmit={(folderData) => {
                    axios.post(route('folders.store'), folderData)
                        .then(() => window.location.reload())
                        .catch(error => console.error('Error creating folder:', error));
                }}
                processing={false}
            />
        </div>
    );
};

export default HomePage;
