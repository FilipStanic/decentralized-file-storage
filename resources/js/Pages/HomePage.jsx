import React, { useState, useRef, useEffect } from "react";
import { useForm, router } from "@inertiajs/react";
import axios from 'axios';

import Sidebar from './Sidebar';
import Header from './Header';
import UploadModal from './UploadModal';
import WelcomeSection from './WelcomeSection';
import CreateFolderModal from './CreateFolderModal';
import AuthenticatedContentView from './AuthenticatedContentView';

export const HomePage = ({
                             auth,
                             recentFiles = [],
                             quickAccessFiles = []
                         }) => {
    const [expanded, setExpanded] = useState(true);
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

    const fileInputRef = useRef(null);
    const modalRef = useRef(null);

    const isAuthenticated = auth && auth.user;

    const uploadForm = useForm({
        file: null,
    });

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredRecentFiles(recentFiles);
            setFilteredQuickAccessFiles(quickAccessFiles);
            setShowSearchResults(false);
            setUniqueResultsCount(0);
        } else {
            handleSearch(searchTerm, recentFiles, quickAccessFiles);
        }
    }, [recentFiles, quickAccessFiles]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (modalRef.current && !modalRef.current.contains(event.target) && showUploadModal) {
                closeUploadModal();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showUploadModal]);

    const handleCreateNew = (type = 'file') => {
        if (type === 'folder') {
            setShowFolderModal(true);
        } else {
            uploadForm.reset();
            setShowUploadModal(true);
        }
    };

    const closeUploadModal = () => {
        setShowUploadModal(false);
        uploadForm.reset();
    }

    const handleFileUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            uploadForm.setData('file', e.target.files[0]);
            setShowUploadModal(true);
        }
    };

    const handleSubmitUpload = (e) => {
        if (e) e.preventDefault();
        if (!uploadForm.data.file) return;
        const formData = { ...uploadForm.data };
        if (currentFolderId) {
            formData.folder_id = currentFolderId;
        }

        uploadForm.post(route('files.store'), {
            data: formData,
            preserveScroll: true,
            onSuccess: () => {
                closeUploadModal();
                router.reload({ only: ['recentFiles', 'quickAccessFiles'] });
            },
            onError: (errors) => {
                console.error("Upload errors:", errors);
            },
        });
    };

    const handleCreateFolder = (folderData) => {
        setProcessingFolder(true);
        const postData = { ...folderData };
        if (currentFolderId) {
            postData.parent_id = currentFolderId;
        }

        axios.post(route('folders.store'), postData)
            .then(() => {
                setShowFolderModal(false);
                localStorage.removeItem('sidebarData');
                localStorage.removeItem('sidebarDataTimestamp');
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
            uploadForm.setData('file', e.dataTransfer.files[0]);
            setShowUploadModal(true);
        }
    };

    const handleSearch = (term, currentRecent = recentFiles, currentQuick = quickAccessFiles) => {
        setSearchTerm(term);

        if (!term.trim()) {
            setFilteredRecentFiles(currentRecent);
            setFilteredQuickAccessFiles(currentQuick);
            setShowSearchResults(false);
            setUniqueResultsCount(0);
            return;
        }

        setShowSearchResults(true);
        const lowerCaseTerm = term.toLowerCase();
        const allMatchingFiles = new Map();

        currentRecent.forEach(file => {
            if (file.name.toLowerCase().includes(lowerCaseTerm)) {
                allMatchingFiles.set(file.id, { ...file, source: 'recent' });
            }
        });

        currentQuick.forEach(file => {
            if (file.name.toLowerCase().includes(lowerCaseTerm)) {
                const existing = allMatchingFiles.get(file.id);
                allMatchingFiles.set(file.id, {
                    ...file,
                    source: existing ? 'both' : 'quickAccess'
                });
            }
        });

        const uniqueMatchingFilesArray = Array.from(allMatchingFiles.values());
        const filteredQuick = uniqueMatchingFilesArray.filter(f => f.source === 'quickAccess' || f.source === 'both');
        const filteredRecent = uniqueMatchingFilesArray.filter(f => f.source === 'recent');

        setFilteredQuickAccessFiles(filteredQuick);
        setFilteredRecentFiles(filteredRecent);
        setUniqueResultsCount(uniqueMatchingFilesArray.length);
    };

    const handleUploadFromWelcome = () => {
        if (uploadForm.data.file) {
            handleSubmitUpload();
        } else {
            handleFileUpload();
        }
    }

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
                    onUserDropdownToggle={() => {}}
                    onSearch={handleSearch}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                />
                {isAuthenticated ? (
                    <AuthenticatedContentView
                        quickAccessFiles={filteredQuickAccessFiles}
                        recentFiles={filteredRecentFiles}
                        searchTerm={searchTerm}
                        showSearchResults={showSearchResults}
                        uniqueResultsCount={uniqueResultsCount}
                        handleCreateNew={handleCreateNew}
                        uploadFileData={uploadForm.data.file}
                        dragActive={dragActive}
                        handleDrag={handleDrag}
                        handleDrop={handleDrop}
                        handleFileUpload={handleFileUpload}
                        fileInputRef={fileInputRef}
                        handleUploadFromWelcome={handleUploadFromWelcome}
                        hasAnyFilesInitially={recentFiles.length > 0 || quickAccessFiles.length > 0}
                    />
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
                onClose={closeUploadModal}
                file={uploadForm.data.file}
                dragActive={dragActive}
                handleDrag={handleDrag}
                handleDrop={handleDrop}
                handleFileUpload={handleFileUpload}
                handleFileChange={handleFileChange}
                handleSubmit={handleSubmitUpload}
                fileInputRef={fileInputRef}
                processing={uploadForm.processing}
                errors={uploadForm.errors}
                progress={uploadForm.progress}
                folderId={currentFolderId}
                modalRef={modalRef}
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
