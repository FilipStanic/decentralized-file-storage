import React, { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react'; 
import { router } from '@inertiajs/core'; 
import { FilePlus } from 'lucide-react'; 
import Sidebar from '@/Pages/Shared/Sidebar.jsx';
import Header from '@/Pages/Shared/Header.jsx';
import StarredItems from '@/Pages/Starred/StarredItems.jsx';
import { useSearch } from '@/Pages/Context/SearchContext.jsx';
import UploadModal from '@/Pages/UploadModal'; 
import axios from 'axios'; 

export default function Index({ auth, starredFiles, starredFolders }) {
    const isAuthenticated = auth && auth.user;
    const { searchTerm, isSearching } = useSearch();

    
    const [filteredFiles, setFilteredFiles] = useState(starredFiles);
    const [filteredFolders, setFilteredFolders] = useState(starredFolders);
    const [totalResults, setTotalResults] = useState(0);

    
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);
    const [uploadData, setUploadData] = useState({ file: null });
    const [uploadProcessing, setUploadProcessing] = useState(false);
    const [uploadErrors, setUploadErrors] = useState({});
    const [uploadProgress, setUploadProgress] = useState(null);

    const handleUpload = () => setShowUploadModal(true);
    const handleFileUpload = () => fileInputRef.current.click();
    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setUploadData({ ...uploadData, file: e.target.files[0] });
            setShowUploadModal(true);
        }
    };
    const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type === "dragenter" || e.type === "dragover"); };
    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation(); setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setUploadData({ ...uploadData, file: e.dataTransfer.files[0] });
            setShowUploadModal(true);
        }
    };
    const handleUploadSubmit = (e) => {
        if (e) e.preventDefault();
        if (!uploadData.file) return;
        setUploadProcessing(true); setUploadProgress(0); setUploadErrors({});

        const formData = new FormData();
        formData.append('file', uploadData.file);
        formData.append('folder_id', ''); 

        axios.post(route('files.store'), formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: progressEvent => setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total))
        }).then(() => {
            setShowUploadModal(false); setUploadData({ file: null }); setUploadProgress(null);
             router.visit(route('home')); 
        }).catch(error => {
            setUploadErrors(error.response?.data?.errors || { file: "Upload failed." });
        }).finally(() => {
            setUploadProcessing(false);
        });
    };
    

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredFiles(starredFiles);
            setFilteredFolders(starredFolders);
            setTotalResults(starredFiles.length + starredFolders.length);
            return;
        }

        const lowerCaseTerm = searchTerm.toLowerCase();

        const matchingFiles = starredFiles.filter(file =>
            file.name.toLowerCase().includes(lowerCaseTerm)
        );

        const matchingFolders = starredFolders.filter(folder =>
            folder.name.toLowerCase().includes(lowerCaseTerm)
        );

        setFilteredFiles(matchingFiles);
        setFilteredFolders(matchingFolders);
        setTotalResults(matchingFiles.length + matchingFolders.length);
    }, [searchTerm, starredFiles, starredFolders]);

    return (
        <>
            <Head title="Starred Items" />
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

            <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                <Sidebar expanded={true} onCreateNew={handleUpload} />

                <div className="flex-1 p-4 overflow-auto bg-gray-50 dark:bg-gray-900" onDragOver={handleDrag} onDragEnter={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}>
                    <Header
                        isAuthenticated={isAuthenticated}
                        auth={auth}
                        onUserDropdownToggle={() => {}}
                    />

                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                            {isSearching ? 'Search Results in Starred Items' : 'Starred Items'}
                        </h1>

                        {isSearching ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Found {totalResults} {totalResults === 1 ? 'result' : 'results'} for "{searchTerm}"
                            </p>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Your favorite files and folders in one place
                            </p>
                        )}
                    </div>

                    {filteredFolders.length > 0 && (
                        <StarredItems items={filteredFolders} type="folders" />
                    )}

                    {filteredFiles.length > 0 && (
                         <StarredItems items={filteredFiles} type="files" />
                    )}

                    {isSearching && totalResults === 0 && (
                        <div className="text-center py-8 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg">
                           <p className="text-gray-500 dark:text-gray-400">No starred items matching "{searchTerm}".</p>
                       </div>
                    )}

                    {!isSearching && starredFiles.length === 0 && starredFolders.length === 0 && (
                         <div className="text-center py-8 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg">
                            <p className="text-gray-500 dark:text-gray-400">No starred items yet. Click the star icon on any file or folder to add it here.</p>
                        </div>
                    )}

                </div>
            </div>

            <UploadModal
                isOpen={showUploadModal}
                onClose={() => { setShowUploadModal(false); setUploadData({ file: null }); setUploadProgress(null); setUploadErrors({}); }}
                file={uploadData.file}
                dragActive={dragActive} handleDrag={handleDrag} handleDrop={handleDrop}
                handleFileUpload={handleFileUpload} handleFileChange={handleFileChange}
                handleSubmit={handleUploadSubmit} fileInputRef={fileInputRef}
                processing={uploadProcessing} errors={uploadErrors} progress={uploadProgress}
                folderId={null} 
            />
        </>
    );
}