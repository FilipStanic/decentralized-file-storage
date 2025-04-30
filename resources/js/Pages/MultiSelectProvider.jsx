import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';

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

    
    const [isShiftKeyPressed, setIsShiftKeyPressed] = useState(false);

    
    const [lastSelectedItem, setLastSelectedItem] = useState(null);

    
    const toggleSelectionMode = useCallback(() => {
        setIsSelectionMode(prev => !prev);
        if (isSelectionMode) {
            
            clearSelection();
        }
    }, [isSelectionMode]);

    
    const clearSelection = useCallback(() => {
        setSelectedItems({ files: [], folders: [] });
        setLastSelectedItem(null);
    }, []);

    
    const toggleFileSelection = useCallback((file) => {
        setSelectedItems(prevState => {
            const isSelected = prevState.files.some(f => f.id === file.id);

            
            if (isShiftKeyPressed && lastSelectedItem && lastSelectedItem.type === 'file') {
                
                return {
                    ...prevState,
                    files: isSelected
                        ? prevState.files.filter(f => f.id !== file.id)
                        : [...prevState.files, file]
                };
            }

            
            return {
                ...prevState,
                files: isSelected
                    ? prevState.files.filter(f => f.id !== file.id)
                    : [...prevState.files, file]
            };
        });

        
        setLastSelectedItem({ type: 'file', id: file.id });
    }, [isShiftKeyPressed, lastSelectedItem]);

    
    const toggleFolderSelection = useCallback((folder) => {
        setSelectedItems(prevState => {
            const isSelected = prevState.folders.some(f => f.id === folder.id);

            
            if (isShiftKeyPressed && lastSelectedItem && lastSelectedItem.type === 'folder') {
                
                return {
                    ...prevState,
                    folders: isSelected
                        ? prevState.folders.filter(f => f.id !== folder.id)
                        : [...prevState.folders, folder]
                };
            }

            
            return {
                ...prevState,
                folders: isSelected
                    ? prevState.folders.filter(f => f.id !== folder.id)
                    : [...prevState.folders, folder]
            };
        });

        
        setLastSelectedItem({ type: 'folder', id: folder.id });
    }, [isShiftKeyPressed, lastSelectedItem]);

    
    const selectAllFiles = useCallback((files) => {
        if (!files) return;

        
        const filesArray = Array.isArray(files) ? files : [];

        setSelectedItems(prev => ({
            ...prev,
            files: [...filesArray]
        }));
    }, []);

    
    const selectAllFolders = useCallback((folders) => {
        if (!folders) return;

        
        const foldersArray = Array.isArray(folders) ? folders : [];

        setSelectedItems(prev => ({
            ...prev,
            folders: [...foldersArray]
        }));
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

    
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Shift') {
                setIsShiftKeyPressed(true);
            }
        };

        const handleKeyUp = (e) => {
            if (e.key === 'Shift') {
                setIsShiftKeyPressed(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

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
        getSelectionCount
    };

    return (
        <MultiSelectContext.Provider value={value}>
            {children}
        </MultiSelectContext.Provider>
    );
};

export default MultiSelectContext;
