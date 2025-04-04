import React, { useState, useRef, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import axios from 'axios';
import { Search } from 'lucide-react';

import Sidebar from './Sidebar';
import Header from './Header';
import QuickAccessFiles from './QuickAccessFiles';
import RecentFiles from './RecentFiles';
import UploadModal from './UploadModal';
import WelcomeSection from './WelcomeSection';
import CreateFolderModal from './CreateFolderModal';

export const HomePage = ({
                             auth,
                             recentFiles = [],
                             quickAccessFiles = []
                         }) => {
    const [expanded, setExpanded] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [processingFolder, setProcessingFolder] = useState(false);
    const [currentFolderId, setCurrentFolderId] = useState(null);

    
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredRecentFiles, setFilteredRecentFiles] = useState(recentFiles);
    const [filteredQuickAccessFiles, setFilteredQuickAccessFiles] = useState(quickAccessFiles);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [uniqueResultsCount, setUniqueResultsCount] = useState(0);

    
    const [displayedFileIds, setDisplayedFileIds] = useState(new Set());

    const dropdownRef = useRef(null);
    const modalRef = useRef(null);
    const fileInputRef = useRef(null);

    const isAuthenticated = auth && auth.user;

    const {
        data,
        setData,
        post,
        processing,
        progress,
        errors,
        reset
    } = useForm({
        file: null,
    });

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }

            if (modalRef.current && !modalRef.current.contains(event.target) && showUploadModal) {
                setShowUploadModal(false);
                reset();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef, modalRef, showUploadModal]);

    
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

    const handleFileUpload = () => {
        fileInputRef.current.click();
    };

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

    const handleCreateFolder = (folderData) => {
        setProcessingFolder(true);

        axios.post(route('folders.store'), folderData)
            .then(response => {
                setShowFolderModal(false);
                window.location.reload();
            })
            .catch(error => {
                console.error('Error creating folder:', error);
            })
            .finally(() => {
                setProcessingFolder(false);
            });
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setData('file', e.dataTransfer.files[0]);
        }
    };

    const toggleUserDropdown = () => {
        setDropdownOpen(prev => !prev);
    };

    const handleUploadFromWelcome = () => {
        if (data.file) {
            handleSubmit();
        } else {
            setShowUploadModal(true);
        }
    };

    
    const handleSearch = (term) => {
        setSearchTerm(term);
        setDisplayedFileIds(new Set()); 

        if (!term.trim()) {
            
            setFilteredRecentFiles(recentFiles);
            setFilteredQuickAccessFiles(quickAccessFiles);
            setShowSearchResults(false);
            setUniqueResultsCount(0);
            return;
        }

        
        setShowSearchResults(true);

        
        const allMatchingFiles = new Map(); 

        
        recentFiles.forEach(file => {
            if (file.name.toLowerCase().includes(term.toLowerCase())) {
                
                allMatchingFiles.set(file.id, {
                    ...file,
                    source: 'recent'
                });
            }
        });

        
        quickAccessFiles.forEach(file => {
            if (file.name.toLowerCase().includes(term.toLowerCase())) {
                
                allMatchingFiles.set(file.id, {
                    ...file,
                    source: allMatchingFiles.has(file.id) ? 'both' : 'quickAccess'
                });
            }
        });

        
        const uniqueMatchingFiles = Array.from(allMatchingFiles.values());

        
        const quickAccessResults = uniqueMatchingFiles
            .filter(file => file.source === 'quickAccess' || file.source === 'both');

        const recentResults = uniqueMatchingFiles
            .filter(file => file.source === 'recent' && !quickAccessResults.some(qaf => qaf.id === file.id));

        setFilteredQuickAccessFiles(quickAccessResults);
        setFilteredRecentFiles(recentResults);
        setUniqueResultsCount(uniqueMatchingFiles.length);
    };

    
    const shouldDisplayFile = (fileId) => {
        if (displayedFileIds.has(fileId)) {
            return false;
        }

        
        setDisplayedFileIds(prev => new Set([...prev, fileId]));
        return true;
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 relative">
            <Sidebar
                expanded={expanded}
                onCreateNew={handleCreateNew}
            />

            <div className="flex-1 p-4 pt-12 lg:pt-4 overflow-auto bg-gray-50 dark:bg-gray-900">
                <Header
                    isAuthenticated={isAuthenticated}
                    auth={auth}
                    onUserDropdownToggle={toggleUserDropdown}
                    onSearch={handleSearch}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                />

                {/* Show search status if searching */}
                {showSearchResults && searchTerm.trim() && (
                    <div className="mb-4">
                        <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                            Search results for "{searchTerm}"
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {uniqueResultsCount} {uniqueResultsCount === 1 ? 'result' : 'results'} found
                        </p>
                    </div>
                )}

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
                            onUpload={handleUploadFromWelcome}
                        />
                    ) : (
                        <>
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 md:mb-0">
                                    {showSearchResults ? 'Search Results' : 'My Files'}
                                </h2>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleCreateNew('file')}
                                        className="flex items-center justify-center gap-1 px-3 sm:px-4 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm flex-1 md:flex-none"
                                    >
                                        <span>Upload</span>
                                    </button>
                                    <button
                                        onClick={() => handleCreateNew('folder')}
                                        className="flex items-center justify-center gap-1 px-3 sm:px-4 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white text-sm flex-1 md:flex-none"
                                    >
                                        <span>New Folder</span>
                                    </button>
                                </div>
                            </div>

                            {/* Show 'No results found' message when searching with no results */}
                            {showSearchResults && searchTerm.trim() && uniqueResultsCount === 0 ? (
                                <div className="text-center py-10 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg">
                                    <div className="inline-flex rounded-full bg-gray-100 dark:bg-gray-700 p-4 mb-4">
                                        <Search size={24} className="text-gray-500 dark:text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No results found</h3>
                                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                                        We couldn't find any files or folders matching "{searchTerm}".<br />
                                        Try using different keywords or checking for typos.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Only show Quick Access section if there are filtered results or not searching */}
                                    {(filteredQuickAccessFiles.length > 0 || !showSearchResults) && (
                                        <QuickAccessFiles
                                            quickAccessFiles={filteredQuickAccessFiles}
                                        />
                                    )}

                                    {/* Only show Recent Files section if there are filtered results or not searching */}
                                    {(filteredRecentFiles.length > 0 || !showSearchResults) && (
                                        <RecentFiles
                                            recentFiles={filteredRecentFiles}
                                        />
                                    )}
                                </>
                            )}
                        </>
                    )
                ) : (
                    <WelcomeSection
                        isAuthenticated={false}
                    />
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
                folderId={currentFolderId}
            />

            <CreateFolderModal
                isOpen={showFolderModal}
                onClose={() => setShowFolderModal(false)}
                onSubmit={handleCreateFolder}
                processing={processingFolder}
                parentId={currentFolderId}
            />
        </div>
    );
};

export default HomePage;
