import React, { useState, useRef, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import Modal from '@/Components/Modal';
import { FolderIcon } from 'lucide-react';
import axios from 'axios';


import Sidebar from './Sidebar';
import Header from './Header';
import QuickAccessFiles from './QuickAccessFiles';
import RecentFiles from './RecentFiles';
import UploadModal from './UploadModal';
import WelcomeSection from './WelcomeSection';


const CreateFolderModal = ({ isOpen, onClose, onSubmit, processing }) => {
    const [folderName, setFolderName] = useState('');
    const [folderColor, setFolderColor] = useState('#6366F1');

    const colors = [
        '#6366F1',
        '#EF4444',
        '#F59E0B',
        '#10B981',
        '#3B82F6',
        '#8B5CF6',
        '#EC4899',
        '#6B7280',
    ];

    useEffect(() => {
        if (isOpen) {
            setFolderName('');
            setFolderColor('#6366F1');
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (folderName.trim()) {
            onSubmit({ name: folderName, color: folderColor });
        }
    };

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="flex justify-between items-center border-b dark:border-gray-700 px-6 py-4">
                    <h3 className="text-lg font-medium dark:text-white">Create New Folder</h3>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="px-6 py-4">
                        <div className="mb-4">
                            <label htmlFor="folderName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Folder Name
                            </label>
                            <input
                                id="folderName"
                                type="text"
                                value={folderName}
                                onChange={(e) => setFolderName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                placeholder="My Folder"
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Folder Color
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {colors.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setFolderColor(color)}
                                        className={`w-8 h-8 rounded-full ${folderColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                                        style={{ backgroundColor: color }}
                                        aria-label={`Select color ${color}`}
                                    />
                                ))}
                            </div>

                            <div className="flex items-center mt-4">
                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                                    <FolderIcon size={24} style={{ color: folderColor }} />
                                </div>
                                <span className="text-gray-700 dark:text-gray-300">Preview</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t dark:border-gray-700 px-6 py-4">
                        <button
                            type="button"
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                            disabled={!folderName.trim() || processing}
                        >
                            {processing ? 'Creating...' : 'Create Folder'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

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

    // New function to handle folder creation
    const handleCreateFolder = (folderData) => {
        setProcessingFolder(true);

        // Use Inertia or axios to post to the server
        axios.post(route('folders.store'), folderData)
            .then(response => {
                setShowFolderModal(false);
                // Optionally show success notification
                window.location.reload(); // Refresh to see the new folder
            })
            .catch(error => {
                console.error('Error creating folder:', error);
                // Optionally handle error (show message, etc.)
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
            />

            {/* Folder Creation Modal */}
            <CreateFolderModal
                isOpen={showFolderModal}
                onClose={() => setShowFolderModal(false)}
                onSubmit={handleCreateFolder}
                processing={processingFolder}
            />
        </div>
    );
};

export default HomePage;
