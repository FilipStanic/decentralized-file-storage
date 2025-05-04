import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { router } from '@inertiajs/react';

const MultiSelectContext = createContext();

export const useMultiSelect = () => {
    const context = useContext(MultiSelectContext);
    if (!context) {
        throw new Error('useMultiSelect must be used within a MultiSelectProvider');
    }
    return context;
};

export const MultiSelectProvider = ({ children }) => {
    
    const [selectedItems, setSelectedItems] = useState({
        files: [],
        folders: []
    });
    
    
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    
    
    const toggleSelectionMode = useCallback(() => {
        setIsSelectionMode(prev => !prev);
        if (isSelectionMode) {
            clearSelection();
        }
    }, [isSelectionMode]);
    
    
    const clearSelection = useCallback(() => {
        setSelectedItems({ files: [], folders: [] });
    }, []);
    
    
    const toggleFileSelection = useCallback((file) => {
        setSelectedItems(prevState => {
            const isSelected = prevState.files.some(f => f.id === file.id);
            
            return {
                ...prevState,
                files: isSelected
                    ? prevState.files.filter(f => f.id !== file.id)
                    : [...prevState.files, file]
            };
        });
    }, []);
    
    
    const toggleFolderSelection = useCallback((folder) => {
        setSelectedItems(prevState => {
            const isSelected = prevState.folders.some(f => f.id === folder.id);
            
            return {
                ...prevState,
                folders: isSelected
                    ? prevState.folders.filter(f => f.id !== folder.id)
                    : [...prevState.folders, folder]
            };
        });
    }, []);
    
    
    const selectAllFiles = useCallback((files) => {
        if (!files || !Array.isArray(files) || files.length === 0) return;
        
        setSelectedItems(prev => {
            
            const existingFileIds = new Set(prev.files.map(f => f.id));
            
            
            const newFiles = files.filter(file => !existingFileIds.has(file.id));
            
            return {
                ...prev,
                files: [...prev.files, ...newFiles]
            };
        });
    }, []);
    
    
    const selectAllFolders = useCallback((folders) => {
        if (!folders || !Array.isArray(folders) || folders.length === 0) return;
        
        setSelectedItems(prev => {
            
            const existingFolderIds = new Set(prev.folders.map(f => f.id));
            
            
            const newFolders = folders.filter(folder => !existingFolderIds.has(folder.id));
            
            return {
                ...prev,
                folders: [...prev.folders, ...newFolders]
            };
        });
    }, []);
    
    
    const isFileSelected = useCallback((fileId) => {
        return selectedItems.files.some(file => file.id === fileId);
    }, [selectedItems.files]);
    
    
    const isFolderSelected = useCallback((folderId) => {
        return selectedItems.folders.some(folder => folder.id === folderId);
    }, [selectedItems.folders]);
    
    
    const getSelectionCount = useCallback(() => {
        return selectedItems.files.length + selectedItems.folders.length;
    }, [selectedItems]);

    
    const deselectItems = useCallback((fileIds = [], folderIds = []) => {
        setSelectedItems(prev => ({
            files: prev.files.filter(file => !fileIds.includes(file.id)),
            folders: prev.folders.filter(folder => !folderIds.includes(folder.id))
        }));
    }, []);

    
    useEffect(() => {
        if (isSelectionMode) {
            sessionStorage.setItem('multiSelectState', JSON.stringify({
                isSelectionMode,
                selectedItems
            }));
        } else {
            sessionStorage.removeItem('multiSelectState');
        }
    }, [isSelectionMode, selectedItems]);

    
    useEffect(() => {
        const savedState = sessionStorage.getItem('multiSelectState');
        if (savedState) {
            try {
                const { isSelectionMode: savedMode, selectedItems: savedItems } = JSON.parse(savedState);
                setIsSelectionMode(savedMode);
                setSelectedItems(savedItems);
            } catch (e) {
                console.error('Error restoring multi-select state:', e);
                sessionStorage.removeItem('multiSelectState');
            }
        }
    }, []);

    
    useEffect(() => {
        
        const handlePageChange = () => {
            clearSelection();
            setIsSelectionMode(false);
            sessionStorage.removeItem('multiSelectState');
        };

        
        document.addEventListener('inertia:before', handlePageChange);
        
        
        return () => {
            document.removeEventListener('inertia:before', handlePageChange);
        };
    }, [clearSelection]);

    const value = {
        selectedItems,
        isSelectionMode,
        toggleSelectionMode,
        toggleFileSelection,
        toggleFolderSelection,
        clearSelection,
        selectAllFiles,
        selectAllFolders,
        isFileSelected,
        isFolderSelected,
        getSelectionCount,
        deselectItems
    };

    return (
        <MultiSelectContext.Provider value={value}>
            {children}
        </MultiSelectContext.Provider>
    );
};

export default MultiSelectContext;