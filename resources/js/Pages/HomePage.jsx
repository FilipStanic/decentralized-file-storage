import React, { useState, useRef, useEffect } from "react";
import { useForm, router } from "@inertiajs/react";
import axios from "axios";

import Sidebar from "./Shared/Sidebar.jsx";
import Header from "./Shared/Header.jsx";
import UploadModal from "./UploadModal";
import WelcomeSection from "./WelcomeSection";
import CreateFolderModal from "./Folders/CreateFolderModal.jsx";
import AuthenticatedContentView from "./AuthenticatedContentView";
import { useSearch } from "./Context/SearchContext.jsx";
import GlobalSelectionBar from "@/Pages/GlobalSelectionBar";
import { useMultiSelect } from "@/Pages/MultiSelectProvider.jsx";

export const HomePage = ({ auth, recentFiles = [], quickAccessFiles = [] }) => {
    const [expanded, setExpanded] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [processingFolder, setProcessingFolder] = useState(false);
    const [currentFolderId, setCurrentFolderId] = useState(null);

    const [filteredRecentFiles, setFilteredRecentFiles] = useState(recentFiles);
    const [filteredQuickAccessFiles, setFilteredQuickAccessFiles] =
        useState(quickAccessFiles);
    const [uniqueResultsCount, setUniqueResultsCount] = useState(0);

    const fileInputRef = useRef(null);
    const modalRef = useRef(null);

    const isAuthenticated = auth && auth.user;

    const { searchTerm, isSearching, setSearchTerm } = useSearch();
    const { isSelectionMode } = useMultiSelect();

    const uploadForm = useForm({
        file: null,
    });

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (!searchTerm.trim()) {
                setFilteredRecentFiles(recentFiles);
                setFilteredQuickAccessFiles(quickAccessFiles);
                setUniqueResultsCount(0);
            } else {
                performSearch(searchTerm, recentFiles, quickAccessFiles);
            }
        }, 300);
    
        return () => clearTimeout(delayDebounce);
    }, [searchTerm, recentFiles, quickAccessFiles]);
    
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target) &&
                showUploadModal
            ) {
                closeUploadModal();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showUploadModal]);

    const performSearch = (
        term,
        currentRecent = recentFiles,
        currentQuick = quickAccessFiles
    ) => {
        if (!term.trim()) {
            setFilteredRecentFiles(currentRecent);
            setFilteredQuickAccessFiles(currentQuick);
            setUniqueResultsCount(0);
            return;
        }

        const lowerCaseTerm = term.toLowerCase();
        const allMatchingFiles = new Map();

        currentRecent.forEach((file) => {
            if (file.name.toLowerCase().includes(lowerCaseTerm)) {
                allMatchingFiles.set(file.id, { ...file, source: "recent" });
            }
        });

        currentQuick.forEach((file) => {
            if (file.name.toLowerCase().includes(lowerCaseTerm)) {
                const existing = allMatchingFiles.get(file.id);
                allMatchingFiles.set(file.id, {
                    ...file,
                    source: existing ? "both" : "quickAccess",
                });
            }
        });

        const uniqueMatchingFilesArray = Array.from(allMatchingFiles.values());
        const filteredQuick = uniqueMatchingFilesArray.filter(
            (f) => f.source === "quickAccess" || f.source === "both"
        );
        const filteredRecent = uniqueMatchingFilesArray.filter(
            (f) => f.source === "recent"
        );

        setFilteredQuickAccessFiles(filteredQuick);
        setFilteredRecentFiles(filteredRecent);
        setUniqueResultsCount(uniqueMatchingFilesArray.length);
    };

    const handleCreateNew = (type = "file") => {
        if (type === "folder") {
            setShowFolderModal(true);
        } else {
            uploadForm.reset();
            fileInputRef.current.value = "";
            setShowUploadModal(true);
        }
    };

    const closeUploadModal = () => {
        setShowUploadModal(false);
        uploadForm.reset();
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleFileUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            uploadForm.setData("file", e.target.files[0]);
            setShowUploadModal(true);
        }
    };

    const handleSubmitUpload = (e) => {
        if (e) e.preventDefault();
        if (!uploadForm.data.file) return;

        const formData = new FormData();
        formData.append("file", uploadForm.data.file);

        if (currentFolderId) {
            formData.append("folder_id", currentFolderId);
        }

        axios
            .post(route("files.store"), formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute("content"),
                },
                onUploadProgress: (p) => {
                    const progress = Math.round((p.loaded * 100) / p.total);
                    uploadForm.setProgress(progress);
                },
            })
            .then((response) => {
                closeUploadModal();

                router.reload({ only: ["recentFiles", "quickAccessFiles"] });
            })
            .catch((error) => {
                console.error("Upload errors:", error);
                if (error.response?.data?.errors) {
                    uploadForm.setError(
                        "file",
                        error.response.data.errors.file
                    );
                } else {
                    uploadForm.setError(
                        "file",
                        "Upload failed. Please try again."
                    );
                }
            })
            .finally(() => {
                uploadForm.setProcessing(false);
            });
    };

    const handleCreateFolder = (folderData) => {
        setProcessingFolder(true);
        const postData = { ...folderData };
        if (currentFolderId) {
            postData.parent_id = currentFolderId;
        }

        axios
            .post(route("folders.store"), postData, {
                headers: {
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute("content"),
                },
            })
            .then(() => {
                setShowFolderModal(false);
                localStorage.removeItem("sidebarData");
                localStorage.removeItem("sidebarDataTimestamp");
                router.reload({ only: ["sharedSidebarFolders"] });
            })
            .catch((error) => {
                console.error("Error creating folder:", error);
            })
            .finally(() => {
                setProcessingFolder(false);
            });
    };

    const handleUploadFromWelcome = () => {
        if (uploadForm.data.file) {
            handleSubmitUpload();
        } else {
            handleFileUpload();
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 relative">
            <Sidebar expanded={expanded} onCreateNew={handleCreateNew} />
            <div className="flex-1 p-4 pt-12 lg:pt-4 overflow-auto bg-gray-50 dark:bg-gray-900">
                <Header
                    isAuthenticated={isAuthenticated}
                    auth={auth}
                    onUserDropdownToggle={() => {}}
                />
                {isAuthenticated && isSelectionMode && (
                    <GlobalSelectionBar
                        contextItems={{
                            files: filteredRecentFiles,
                            folders: [],
                        }}
                    />
                )}
                {isAuthenticated ? (
                    <AuthenticatedContentView
                        quickAccessFiles={filteredQuickAccessFiles}
                        recentFiles={filteredRecentFiles}
                        searchTerm={searchTerm}
                        showSearchResults={isSearching}
                        uniqueResultsCount={uniqueResultsCount}
                        handleCreateNew={handleCreateNew}
                        uploadFileData={uploadForm.data.file}
                        fileInputRef={fileInputRef}
                        handleFileUpload={handleFileUpload}
                        handleUploadFromWelcome={handleUploadFromWelcome}
                        hasAnyFilesInitially={
                            recentFiles.length > 0 ||
                            quickAccessFiles.length > 0
                        }
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
