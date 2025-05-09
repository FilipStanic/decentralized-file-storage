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
    
    const [draggedItem, setDraggedItem] = useState(null);

    
    const [isDragging, setIsDragging] = useState(false);

    
    const [dropTargets, setDropTargets] = useState({
        folders: [],
        trash: false
    });

    
    const dragInfo = useRef({
        sourceElement: null,
        dragStartX: 0,
        dragStartY: 0
    });

    
    const startDraggingFile = useCallback((file, event) => {
        event.dataTransfer.effectAllowed = 'move';
        setDraggedItem({ type: 'file', item: file });
        setIsDragging(true);

        
        dragInfo.current = {
            sourceElement: event.target,
            dragStartX: event.clientX,
            dragStartY: event.clientY
        };

        
        const dragImage = document.createElement('div');
        dragImage.classList.add('drag-preview');
        dragImage.textContent = file.name;
        dragImage.style.position = 'fixed';
        dragImage.style.top = '-1000px';
        document.body.appendChild(dragImage);
        event.dataTransfer.setDragImage(dragImage, 0, 0);

        
        setTimeout(() => {
            document.body.removeChild(dragImage);
        }, 0);
    }, []);

    
    const startDraggingFolder = useCallback((folder, event) => {
        event.dataTransfer.effectAllowed = 'move';
        setDraggedItem({ type: 'folder', item: folder });
        setIsDragging(true);

        
        dragInfo.current = {
            sourceElement: event.target,
            dragStartX: event.clientX,
            dragStartY: event.clientY
        };

        
        const dragImage = document.createElement('div');
        dragImage.classList.add('drag-preview');
        dragImage.textContent = folder.name;
        dragImage.style.position = 'fixed';
        dragImage.style.top = '-1000px';
        document.body.appendChild(dragImage);
        event.dataTransfer.setDragImage(dragImage, 0, 0);

        
        setTimeout(() => {
            document.body.removeChild(dragImage);
        }, 0);
    }, []);

    
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

        
        dragInfo.current = {
            sourceElement: event.target,
            dragStartX: event.clientX,
            dragStartY: event.clientY
        };

        
        const dragImage = document.createElement('div');
        dragImage.classList.add('drag-preview');
        const totalItems = files.length + folders.length;
        dragImage.textContent = `${totalItems} items`;
        dragImage.style.position = 'fixed';
        dragImage.style.top = '-1000px';
        document.body.appendChild(dragImage);
        event.dataTransfer.setDragImage(dragImage, 0, 0);

        
        setTimeout(() => {
            document.body.removeChild(dragImage);
        }, 0);
    }, []);

    
    const handleDropInFolder = useCallback((targetFolderId, event) => {
        event.preventDefault();

        if (!draggedItem) return;

        
        if (draggedItem.type === 'file') {
            const file = draggedItem.item;
            router.post(route('files.move', file.id), {
                folder_id: targetFolderId
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    
                    router.reload({ only: ['files'] });
                }
            });
        }
        
        else if (draggedItem.type === 'folder') {
            const folder = draggedItem.item;

            
            if (folder.id === targetFolderId) {
                console.error("Cannot move a folder into itself");
                return;
            }

            router.post(route('folders.move-folders', targetFolderId), {
                folder_ids: [folder.id]
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    
                    router.reload({ only: ['folders'] });
                }
            });
        }
        
        else if (draggedItem.type === 'multiple') {
            const { files, folders } = draggedItem.items;

            
            if (files.length > 0) {
                const fileIds = files.map(file => file.id);
                router.post(route('folders.move-files', targetFolderId), {
                    file_ids: fileIds
                }, {
                    preserveScroll: true
                });
            }

            
            if (folders.length > 0) {
                const folderIds = folders.map(folder => folder.id);
                router.post(route('folders.move-folders', targetFolderId), {
                    folder_ids: folderIds
                }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        
                        router.reload({ only: ['folders', 'files'] });
                    }
                });
            }
        }

        
        setIsDragging(false);
        setDraggedItem(null);
    }, [draggedItem]);

    
    const handleDropInTrash = useCallback((event) => {
        event.preventDefault();

        if (!draggedItem) return;

        
        if (draggedItem.type === 'file') {
            router.delete(route('files.destroy', draggedItem.item.id), {
                preserveScroll: true,
                onSuccess: () => {
                    
                    router.reload({ only: ['files'] });
                }
            });
        }
        
        else if (draggedItem.type === 'folder') {
            router.delete(route('folders.destroy', draggedItem.item.id), {
                preserveScroll: true,
                onSuccess: () => {
                    
                    router.reload({ only: ['folders'] });
                }
            });
        }
        
        else if (draggedItem.type === 'multiple') {
            const { files, folders } = draggedItem.items;

            
            files.forEach(file => {
                router.post(route('trash.move'), {
                    item_type: 'file',
                    item_id: file.id
                }, {
                    preserveScroll: true
                });
            });

            
            folders.forEach(folder => {
                router.post(route('trash.move'), {
                    item_type: 'folder',
                    item_id: folder.id
                }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        
                        if (folders.indexOf(folder) === folders.length - 1) {
                            router.reload({ only: ['folders', 'files'] });
                        }
                    }
                });
            });
        }

        
        setIsDragging(false);
        setDraggedItem(null);
    }, [draggedItem]);

    
    const endDrag = useCallback(() => {
        setIsDragging(false);
        setDraggedItem(null);
    }, []);

    
    const canDropIntoFolder = useCallback((folder) => {
        if (!draggedItem) return false;

        
        if (draggedItem.type === 'folder' && draggedItem.item.id === folder.id) {
            return false;
        }

        
        if (draggedItem.type === 'folder') {
            
            
        }

        return true;
    }, [draggedItem]);

    
    const handleFolderDragOver = useCallback((folder, event) => {
        event.preventDefault();

        
        if (canDropIntoFolder(folder)) {
            event.dataTransfer.dropEffect = 'move';
        } else {
            event.dataTransfer.dropEffect = 'none';
        }
    }, [canDropIntoFolder]);

    
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
