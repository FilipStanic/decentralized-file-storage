import React, { useState, useRef, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import axios from "axios";
import { useSearch } from "@/Pages/Context/SearchContext.jsx";
import { useMultiSelect } from "@/Pages/MultiSelectProvider.jsx";
import Sidebar from "@/Pages/Shared/Sidebar.jsx";
import Header from "@/Pages/Shared/Header.jsx";
import FolderBreadcrumb from "@/Pages/Folders/FolderBreadcrumb";
import FolderViewToolbar from "@/Pages/Folders/FolderViewToolbar";
import SelectionBar from "@/Pages/Folders/SelectionBar";
import FolderSection from "@/Pages/Folders/FolderSection";
import FileListSection from "@/Pages/Files/FileListSection.jsx";
import EmptySearchResult from "@/Pages/Folders/EmptySearchResult";
import UploadModal from "@/Pages/UploadModal";
import CreateFolderModal from "@/Pages/Folders/CreateFolderModal.jsx";
import RenameFolderModal from "@/Pages/Folders/RenameFolderModal.jsx";
import ConfirmDeleteModal from "@/Pages/ConfirmDeleteModal.jsx";
import FileDetailModal from "@/Pages/Files/FileDetailModal.jsx";
import GlobalSelectionBar from "@/Pages/GlobalSelectionBar";

export default function FolderView({
    auth,
    currentFolder,
    breadcrumbs,
    folders,
    files,
}) {
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const [folderToRename, setFolderToRename] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const [processingFolder, setProcessingFolder] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [showBulkMoveDropdown, setShowBulkMoveDropdown] = useState(false);
    const [destinationFolders, setDestinationFolders] = useState([]);
    const [loadingDestinations, setLoadingDestinations] = useState(true);

    const [data, setData] = useState({ file: null });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [progress, setProgress] = useState(null);

    const { searchTerm, isSearching } = useSearch();
    const [filteredFolders, setFilteredFolders] = useState(folders);
    const [filteredFiles, setFilteredFiles] = useState(files);
    const [totalResults, setTotalResults] = useState(0);

    const fileInputRef = useRef(null);
    const dropdownRef = useRef(null);
    const bulkActionDropdownRef = useRef(null);

    const {
        getSelectionCount,
        clearSelection,
        selectedItems,
        toggleSelectionMode,
        isSelectionMode,
    } = useMultiSelect();

    const isAuthenticated = auth && auth.user;

    useEffect(() => {
        setLoadingDestinations(true);

        const currentFolderId = currentFolder ? currentFolder.id : null;
        axios
            .get(
                route("sidebar.available-folders", {
                    current_folder_id: currentFolderId,
                })
            )
            .then((response) => {
                setDestinationFolders(response.data.folders || []);
                setLoadingDestinations(false);
            })
            .catch((error) => {
                console.error("Error fetching available folders:", error);
                setLoadingDestinations(false);
            });
    }, [currentFolder]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setDropdownOpen(null);
            }

            if (
                bulkActionDropdownRef.current &&
                !bulkActionDropdownRef.current.contains(event.target)
            ) {
                setShowBulkMoveDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef, bulkActionDropdownRef]);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredFolders(folders);
            setFilteredFiles(files);
            setTotalResults(folders.length + files.length);
            return;
        }
        const lowerCaseTerm = searchTerm.toLowerCase();
        const matchingFolders = folders.filter((folder) =>
            folder.name.toLowerCase().includes(lowerCaseTerm)
        );
        const matchingFiles = files.filter((file) =>
            file.name.toLowerCase().includes(lowerCaseTerm)
        );
        setFilteredFolders(matchingFolders);
        setFilteredFiles(matchingFiles);
        setTotalResults(matchingFolders.length + matchingFiles.length);
    }, [searchTerm, folders, files]);

    const handleMoveFile = (fileId, folderId) => {
        setDropdownOpen(null);

        router.post(
            route("files.move", fileId),
            {
                folder_id: folderId,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ["files"] });
                },
                onError: (errors) => {
                    console.error("Error moving file:", errors);
                    alert(
                        `Error moving file: ${
                            errors.message || "Please try again."
                        }`
                    );
                },
            }
        );
    };

    const handleBulkMove = (destinationFolderId) => {
        setShowBulkMoveDropdown(false);

        if (selectedItems.files.length > 0) {
            const fileIds = selectedItems.files.map((file) => file.id);

            if (destinationFolderId === null) {
                router.post(
                    route("folders.move-files-to-root"),
                    {
                        file_ids: fileIds,
                    },
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            router.reload({ only: ["files"] });
                            if (selectedItems.folders.length === 0) {
                                clearSelection();
                                toggleSelectionMode();
                            }
                        },
                        onError: (errors) => {
                            console.error(
                                "Error moving files to root:",
                                errors
                            );
                            alert(
                                "Failed to move files to root folder. Please try again."
                            );
                        },
                    }
                );
            } else {
                router.post(
                    route("folders.move-files", destinationFolderId),
                    {
                        file_ids: fileIds,
                    },
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            router.reload({ only: ["files"] });
                            if (selectedItems.folders.length === 0) {
                                clearSelection();
                                toggleSelectionMode();
                            }
                        },
                        onError: (errors) => {
                            console.error("Error moving files:", errors);
                            alert("Failed to move files. Please try again.");
                        },
                    }
                );
            }
        }

        if (selectedItems.folders.length > 0) {
            const folderIds = selectedItems.folders.map((folder) => folder.id);

            if (destinationFolderId === null) {
                router.post(
                    route("folders.move-folders-to-root"),
                    {
                        folder_ids: folderIds,
                    },
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            router.reload();
                            clearSelection();
                            toggleSelectionMode();
                        },
                        onError: (errors) => {
                            console.error(
                                "Error moving folders to root:",
                                errors
                            );
                            alert(
                                "Failed to move folders to root folder. Please try again."
                            );
                        },
                    }
                );
            } else {
                router.post(
                    route("folders.move-folders", destinationFolderId),
                    {
                        folder_ids: folderIds,
                    },
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            router.reload();
                            clearSelection();
                            toggleSelectionMode();
                        },
                        onError: (errors) => {
                            console.error("Error moving folders:", errors);
                            alert("Failed to move folders. Please try again.");
                        },
                    }
                );
            }
        }
    };

    const handleBulkDelete = () => {
        if (!confirm(`Move ${getSelectionCount()} selected items to trash?`)) {
            return;
        }

        selectedItems.files.forEach((file) => {
            router.delete(route("files.destroy", file.id), {
                preserveScroll: true,
            });
        });

        selectedItems.folders.forEach((folder, index) => {
            router.delete(route("folders.destroy", folder.id), {
                preserveScroll: true,
                onSuccess: () => {
                    if (index === selectedItems.folders.length - 1) {
                        router.reload();
                        clearSelection();
                    }
                },
            });
        });
    };

    const handleUpload = () => setShowUploadModal(true);
    const handleNewFolder = () => setShowFolderModal(true);
    const handleFileUpload = () => fileInputRef.current.click();

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setData({ ...data, file: e.target.files[0] });
        }
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (!data.file) return;
        setProcessing(true);
        setProgress(0);
        const formData = new FormData();
        formData.append("file", data.file);
        if (currentFolder) {
            formData.append("folder_id", currentFolder.id);
        }

        axios
            .post(route("files.store"), formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (p) =>
                    setProgress(Math.round((p.loaded * 100) / p.total)),
            })
            .then(() => {
                setShowUploadModal(false);
                setData({ file: null });
                setProgress(null);
                setErrors({});
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                window.location.reload();
            })
            .catch((err) => {
                setErrors(
                    err.response?.data?.errors || { file: "Upload failed." }
                );
            })
            .finally(() => setProcessing(false));
    };

    const handleCreateFolder = (folderData) => {
        setProcessingFolder(true);
        if (currentFolder) {
            folderData.parent_id = currentFolder.id;
        }
        axios
            .post(route("folders.store"), folderData)
            .then(() => {
                setShowFolderModal(false);
                window.location.reload();
            })
            .catch((error) => console.error("Error creating folder:", error))
            .finally(() => setProcessingFolder(false));
    };

    const toggleDropdown = (fileId) => {
        setDropdownOpen((prev) => (prev === fileId ? null : fileId));
    };

    const handleShowDetails = (file) => {
        setSelectedFile(file);
        setShowDetailModal(true);
    };

    const handleRenameClick = (folder) => {
        setFolderToRename(folder);
        setShowRenameModal(true);
    };

    const handleDeleteClick = (event, file) => {
        event.preventDefault();
        event.stopPropagation();
        setItemToDelete(file);
        setShowConfirmDeleteModal(true);
        setDropdownOpen(null);
    };

    const confirmDeleteAction = () => {
        if (!itemToDelete) return;
        router.delete(route("files.destroy", itemToDelete.id), {
            preserveScroll: true,
            preserveState: true,
            only: ["files"],
            onSuccess: () => {
                setFilteredFiles((prev) =>
                    prev.filter((f) => f.id !== itemToDelete.id)
                );
                setShowConfirmDeleteModal(false);
                setItemToDelete(null);
            },
            onError: (errors) => {
                console.error("Error deleting item:", errors);
                alert("Failed to delete the item. Please try again.");
                setShowConfirmDeleteModal(false);
                setItemToDelete(null);
            },
        });
    };

    const handleFileToggleStar = (event, fileId) => {
        event.preventDefault();
        router.post(
            route("files.toggle-star", fileId),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                only: ["files", "quickAccessFiles"],
                onSuccess: () => {
                    setFilteredFiles((prevFiles) =>
                        prevFiles.map((f) =>
                            f.id === fileId ? { ...f, starred: !f.starred } : f
                        )
                    );
                },
            }
        );
    };

    return (
        <>
            <Head title={currentFolder ? currentFolder.name : "All Folders"} />
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />
            <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                <Sidebar
                    expanded={true}
                    onCreateNew={(type) =>
                        type === "folder" ? handleNewFolder() : handleUpload()
                    }
                />
                <div className="flex-1 p-4 overflow-auto bg-gray-50 dark:bg-gray-900">
                    <Header
                        isAuthenticated={isAuthenticated}
                        auth={auth}
                        onUserDropdownToggle={() => {}}
                    />
                    <FolderBreadcrumb breadcrumbs={breadcrumbs} />

                    {!isSelectionMode && (
                        <FolderViewToolbar
                            isSearching={isSearching}
                            currentFolder={currentFolder}
                            searchTerm={searchTerm}
                            totalResults={totalResults}
                            handleNewFolder={handleNewFolder}
                            handleUpload={handleUpload}
                        />
                    )}
                    {isSelectionMode && (
                        <GlobalSelectionBar
                            contextItems={{
                                files: filteredFiles,
                                folders: filteredFolders,
                            }}
                            currentFolderId={
                                currentFolder ? currentFolder.id : null
                            }
                        />
                    )}

                    <FolderSection
                        filteredFolders={filteredFolders}
                        isSearching={isSearching}
                        onRenameClick={handleRenameClick}
                    />

                    <FileListSection
                        filteredFiles={filteredFiles}
                        isSearching={isSearching}
                        searchTerm={searchTerm}
                        currentFolder={currentFolder}
                        handleShowDetails={handleShowDetails}
                        handleFileToggleStar={handleFileToggleStar}
                        handleDeleteClick={handleDeleteClick}
                        handleMoveFile={handleMoveFile}
                    />

                    {isSearching && totalResults === 0 && (
                        <EmptySearchResult
                            searchTerm={searchTerm}
                            currentFolder={currentFolder}
                        />
                    )}
                </div>
            </div>

            <UploadModal
                isOpen={showUploadModal}
                onClose={() => {
                    setShowUploadModal(false);
                    setData({ file: null });
                    setProgress(null);
                    setErrors({});
                    if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                    }
                }}
                file={data.file}
                handleFileUpload={handleFileUpload}
                handleFileChange={handleFileChange}
                handleSubmit={handleSubmit}
                fileInputRef={fileInputRef}
                processing={processing}
                errors={errors}
                progress={progress}
                folderId={currentFolder?.id}
            />

            <CreateFolderModal
                isOpen={showFolderModal}
                onClose={() => setShowFolderModal(false)}
                onSubmit={handleCreateFolder}
                processing={processingFolder}
                parentId={currentFolder?.id}
            />

            <FileDetailModal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                file={selectedFile}
            />

            <RenameFolderModal
                isOpen={showRenameModal}
                onClose={() => {
                    setShowRenameModal(false);
                    setFolderToRename(null);
                }}
                folder={folderToRename}
            />

            <ConfirmDeleteModal
                isOpen={showConfirmDeleteModal}
                onClose={() => {
                    setShowConfirmDeleteModal(false);
                    setItemToDelete(null);
                }}
                onConfirm={confirmDeleteAction}
                itemName={itemToDelete?.name}
                itemType="file"
            />
        </>
    );
}
