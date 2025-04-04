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
            // Close dropdown if clicked outside
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }

            // Close modal if clicked outside
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

    // Modified to handle different creation types
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

    // Function to handle folder creation
    const handleCreateFolder = (folderData) => {
        setProcessingFolder(true);

        axios.post(route('folders.store'), folderData)
            .then(response => {
                setShowFolderModal(false);
                window.location.reload(); // Refresh to see the new folder
            })
            .catch(error => {
                console.error('Error creating folder:', error);
            })
            .finally(() => {
                setProcessingFolder(false);
            });
    };

    // Handle drag events
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

    // Handle file upload from the WelcomeSection
    const handleUploadFromWelcome = () => {
        // If we already have a file set, submit the form
        if (data.file) {
            handleSubmit();
        } else {
            // Otherwise, show the upload modal
            setShowUploadModal(true);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar - pass the updated handler */}
            <Sidebar
                expanded={expanded}
                onCreateNew={handleCreateNew}
            />

            {/* Main content */}
            <div className="flex-1 p-4 overflow-auto bg-gray-50 dark:bg-gray-900">
                {/* Header */}
                <Header
                    isAuthenticated={isAuthenticated}
                    auth={auth}
                    onUserDropdownToggle={toggleUserDropdown}
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
                            onUpload={handleUploadFromWelcome}
                        />
                    ) : (
                        <>
                            {/* Quick access section */}
                            <QuickAccessFiles quickAccessFiles={quickAccessFiles} />

                            {/* Recent files section */}
                            <RecentFiles recentFiles={recentFiles} />
                        </>
                    )
                ) : (
                    <WelcomeSection
                        isAuthenticated={false}
                    />
                )}
            </div>

            {/* Hidden file input for uploading */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Upload Modal */}
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

            {/* Create Folder Modal */}
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
