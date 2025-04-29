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
    // Track selected items (files and folders)
    const [selectedItems, setSelectedItems] = useState({
        files: [],
        folders: []
    });

    // Track if selection mode is active
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    // Track if shift key is pressed (for range selection)
    const [isShiftKeyPressed, setIsShiftKeyPressed] = useState(false);

    // Track last selected item for range selection
    const [lastSelectedItem, setLastSelectedItem] = useState(null);

    // Toggle selection mode
    const toggleSelectionMode = useCallback(() => {
        setIsSelectionMode(prev => !prev);
        if (isSelectionMode) {
            // Clear selections when exiting selection mode
            clearSelection();
        }
    }, [isSelectionMode]);

    // Clear all selections
    const clearSelection = useCallback(() => {
        setSelectedItems({ files: [], folders: [] });
        setLastSelectedItem(null);
    }, []);

    // Select or deselect a file
    const toggleFileSelection = useCallback((file) => {
        setSelectedItems(prevState => {
            const isSelected = prevState.files.some(f => f.id === file.id);

            // If shift key is pressed and we have a previous selection, select range
            if (isShiftKeyPressed && lastSelectedItem && lastSelectedItem.type === 'file') {
                // Implement range selection logic here
                // For simplicity, we're not implementing the full range selection in this example
                return {
                    ...prevState,
                    files: isSelected
                        ? prevState.files.filter(f => f.id !== file.id)
                        : [...prevState.files, file]
                };
            }

            // Normal toggle selection
            return {
                ...prevState,
                files: isSelected
                    ? prevState.files.filter(f => f.id !== file.id)
                    : [...prevState.files, file]
            };
        });

        // Update last selected item
        setLastSelectedItem({ type: 'file', id: file.id });
    }, [isShiftKeyPressed, lastSelectedItem]);

    // Select or deselect a folder
    const toggleFolderSelection = useCallback((folder) => {
        setSelectedItems(prevState => {
            const isSelected = prevState.folders.some(f => f.id === folder.id);

            // If shift key is pressed and we have a previous selection, select range
            if (isShiftKeyPressed && lastSelectedItem && lastSelectedItem.type === 'folder') {
                // Implement range selection logic here
                return {
                    ...prevState,
                    folders: isSelected
                        ? prevState.folders.filter(f => f.id !== folder.id)
                        : [...prevState.folders, folder]
                };
            }

            // Normal toggle selection
            return {
                ...prevState,
                folders: isSelected
                    ? prevState.folders.filter(f => f.id !== folder.id)
                    : [...prevState.folders, folder]
            };
        });

        // Update last selected item
        setLastSelectedItem({ type: 'folder', id: folder.id });
    }, [isShiftKeyPressed, lastSelectedItem]);

    // Select all files
    const selectAllFiles = useCallback((files) => {
        setSelectedItems(prev => ({
            ...prev,
            files: [...files]
        }));
    }, []);

    // Select all folders
    const selectAllFolders = useCallback((folders) => {
        setSelectedItems(prev => ({
            ...prev,
            folders: [...folders]
        }));
    }, []);

    // Check if file is selected
    const isFileSelected = useCallback((fileId) => {
        return selectedItems.files.some(file => file.id === fileId);
    }, [selectedItems.files]);

    // Check if folder is selected
    const isFolderSelected = useCallback((folderId) => {
        return selectedItems.folders.some(folder => folder.id === folderId);
    }, [selectedItems.folders]);

    // Get total number of selected items
    const getSelectionCount = useCallback(() => {
        return selectedItems.files.length + selectedItems.folders.length;
    }, [selectedItems]);

    // Handle keyboard events for shift key
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
