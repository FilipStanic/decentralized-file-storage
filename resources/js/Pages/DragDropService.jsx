import React, { createContext, useState, useContext, useRef, useCallback } from 'react';
import { router } from '@inertiajs/react';

const DragDropContext = createContext();

export const useDragDrop = () => {
    const context = useContext(DragDropContext);
    if (!context) {
        throw new Error('useDragDrop must be used within a DragDropProvider');
    }
    return context;
};

export const DragDropProvider = ({ children }) => {
    // Track the item being dragged
    const [draggedItem, setDraggedItem] = useState(null);

    // Track current drag operation
    const [isDragging, setIsDragging] = useState(false);

    // Track where we can drop
    const [dropTargets, setDropTargets] = useState({
        folders: [],
        trash: false
    });

    // Store information about source and target for drag operations
    const dragInfo = useRef({
        sourceElement: null,
        dragStartX: 0,
        dragStartY: 0
    });

    // Start dragging a file
    const startDraggingFile = useCallback((file, event) => {
        event.dataTransfer.effectAllowed = 'move';
        setDraggedItem({ type: 'file', item: file });
        setIsDragging(true);

        // Store starting position for visual feedback
        dragInfo.current = {
            sourceElement: event.target,
            dragStartX: event.clientX,
            dragStartY: event.clientY
        };

        // Set a drag image (optional)
        const dragImage = document.createElement('div');
        dragImage.classList.add('drag-preview');
        dragImage.textContent = file.name;
        dragImage.style.position = 'fixed';
        dragImage.style.top = '-1000px';
        document.body.appendChild(dragImage);
        event.dataTransfer.setDragImage(dragImage, 0, 0);

        // Clean up after drag image is captured
        setTimeout(() => {
            document.body.removeChild(dragImage);
        }, 0);
    }, []);

    // Start dragging a folder
    const startDraggingFolder = useCallback((folder, event) => {
        event.dataTransfer.effectAllowed = 'move';
        setDraggedItem({ type: 'folder', item: folder });
        setIsDragging(true);

        // Store starting position
        dragInfo.current = {
            sourceElement: event.target,
            dragStartX: event.clientX,
            dragStartY: event.clientY
        };

        // Set a drag image (optional)
        const dragImage = document.createElement('div');
        dragImage.classList.add('drag-preview');
        dragImage.textContent = folder.name;
        dragImage.style.position = 'fixed';
        dragImage.style.top = '-1000px';
        document.body.appendChild(dragImage);
        event.dataTransfer.setDragImage(dragImage, 0, 0);

        // Clean up after drag image is captured
        setTimeout(() => {
            document.body.removeChild(dragImage);
        }, 0);
    }, []);

    // Start dragging multiple items
    const startDraggingMultiple = useCallback((files, folders, event) => {
        event.dataTransfer.effectAllowed = 'move';
        setDraggedItem({
            type: 'multiple',
            items: {
                files,
                folders
            }
        });
        setIsDragging(true);

        // Store starting position
        dragInfo.current = {
            sourceElement: event.target,
            dragStartX: event.clientX,
            dragStartY: event.clientY
        };

        // Set a drag image for multiple items
        const dragImage = document.createElement('div');
        dragImage.classList.add('drag-preview');
        const totalItems = files.length + folders.length;
        dragImage.textContent = `${totalItems} items`;
        dragImage.style.position = 'fixed';
        dragImage.style.top = '-1000px';
        document.body.appendChild(dragImage);
        event.dataTransfer.setDragImage(dragImage, 0, 0);

        // Clean up after drag image is captured
        setTimeout(() => {
            document.body.removeChild(dragImage);
        }, 0);
    }, []);

    // Process drop into a folder
    const handleDropInFolder = useCallback((targetFolderId, event) => {
        event.preventDefault();

        if (!draggedItem) return;

        // Handle single file drop
        if (draggedItem.type === 'file') {
            const file = draggedItem.item;
            router.post(route('files.move', file.id), {
                folder_id: targetFolderId
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    // Refresh content after drop
                    router.reload({ only: ['files'] });
                }
            });
        }
        // Handle single folder drop
        else if (draggedItem.type === 'folder') {
            const folder = draggedItem.item;

            // Prevent dropping a folder into itself or its children
            if (folder.id === targetFolderId) {
                console.error("Cannot move a folder into itself");
                return;
            }

            router.post(route('folders.move-folders', targetFolderId), {
                folder_ids: [folder.id]
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    // Refresh content after drop
                    router.reload({ only: ['folders'] });
                }
            });
        }
        // Handle multiple items drop
        else if (draggedItem.type === 'multiple') {
            const { files, folders } = draggedItem.items;

            // Move files if there are any
            if (files.length > 0) {
                const fileIds = files.map(file => file.id);
                router.post(route('folders.move-files', targetFolderId), {
                    file_ids: fileIds
                }, {
                    preserveScroll: true
                });
            }

            // Move folders if there are any
            if (folders.length > 0) {
                const folderIds = folders.map(folder => folder.id);
                router.post(route('folders.move-folders', targetFolderId), {
                    folder_ids: folderIds
                }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        // Refresh content after all operations
                        router.reload({ only: ['folders', 'files'] });
                    }
                });
            }
        }

        // Reset drag state
        setIsDragging(false);
        setDraggedItem(null);
    }, [draggedItem]);

    // Process drop into trash
    const handleDropInTrash = useCallback((event) => {
        event.preventDefault();

        if (!draggedItem) return;

        // Handle single file
        if (draggedItem.type === 'file') {
            router.delete(route('files.destroy', draggedItem.item.id), {
                preserveScroll: true,
                onSuccess: () => {
                    // Refresh files list
                    router.reload({ only: ['files'] });
                }
            });
        }
        // Handle single folder
        else if (draggedItem.type === 'folder') {
            router.delete(route('folders.destroy', draggedItem.item.id), {
                preserveScroll: true,
                onSuccess: () => {
                    // Refresh folders list
                    router.reload({ only: ['folders'] });
                }
            });
        }
        // Handle multiple items
        else if (draggedItem.type === 'multiple') {
            const { files, folders } = draggedItem.items;

            // Process files
            files.forEach(file => {
                router.post(route('trash.move'), {
                    item_type: 'file',
                    item_id: file.id
                }, {
                    preserveScroll: true
                });
            });

            // Process folders
            folders.forEach(folder => {
                router.post(route('trash.move'), {
                    item_type: 'folder',
                    item_id: folder.id
                }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        // Refresh after all operations
                        if (folders.indexOf(folder) === folders.length - 1) {
                            router.reload({ only: ['folders', 'files'] });
                        }
                    }
                });
            });
        }

        // Reset drag state
        setIsDragging(false);
        setDraggedItem(null);
    }, [draggedItem]);

    // End the drag operation
    const endDrag = useCallback(() => {
        setIsDragging(false);
        setDraggedItem(null);
    }, []);

    // Check if a folder can be a drop target
    const canDropIntoFolder = useCallback((folder) => {
        if (!draggedItem) return false;

        // Can't drop into itself
        if (draggedItem.type === 'folder' && draggedItem.item.id === folder.id) {
            return false;
        }

        // Can't drop into a child folder
        if (draggedItem.type === 'folder') {
            // Would need to check if the target is a child of the dragged folder
            // This would require additional logic to traverse the folder structure
        }

        return true;
    }, [draggedItem]);

    // When a folder is dragged over
    const handleFolderDragOver = useCallback((folder, event) => {
        event.preventDefault();

        // Set drop effect
        if (canDropIntoFolder(folder)) {
            event.dataTransfer.dropEffect = 'move';
        } else {
            event.dataTransfer.dropEffect = 'none';
        }
    }, [canDropIntoFolder]);

    // Value to provide through context
    const value = {
        isDragging,
        draggedItem,
        startDraggingFile,
        startDraggingFolder,
        startDraggingMultiple,
        handleDropInFolder,
        handleDropInTrash,
        handleFolderDragOver,
        canDropIntoFolder,
        endDrag
    };

    return (
        <DragDropContext.Provider value={value}>
            {children}
        </DragDropContext.Provider>
    );
};

export default DragDropContext;
