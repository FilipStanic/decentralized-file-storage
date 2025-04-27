import React, { useState, useEffect, useRef } from 'react'; 
import { Head } from '@inertiajs/react';
import { ExternalLink, Download, Database, Info, FilePlus } from 'lucide-react';
import Sidebar from '@/Pages/Shared/Sidebar.jsx';
import Header from '@/Pages/Shared/Header.jsx';
import FileDetailModal from '@/Pages/Files/FileDetailModal.jsx';
import UploadModal from '@/Pages/UploadModal'; 
import { useSearch } from '@/Pages/Context/SearchContext.jsx'; 
import axios from 'axios'; 

const IPFSIndex = ({ auth, ipfsFiles }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const isAuthenticated = auth && auth.user;

    
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

    const { searchTerm } = useSearch();
    const [filteredIpfsFiles, setFilteredIpfsFiles] = useState(ipfsFiles);

    useEffect(() => {
        const lowerCaseTerm = searchTerm.toLowerCase();
        setFilteredIpfsFiles(
            !searchTerm.trim()
                ? ipfsFiles
                : ipfsFiles.filter(file =>
                    file.name.toLowerCase().includes(lowerCaseTerm) ||
                    file.ipfs_hash.toLowerCase().includes(lowerCaseTerm) 
                )
        );
    }, [searchTerm, ipfsFiles]);
    

    const handleShowDetails = (file) => {
        setSelectedFile(file);
        setShowDetailModal(true);
    };

    return (
        <>
            <Head title="IPFS Files" />
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
                        <div className="flex items-center gap-2 mb-2">
                            <Database size={24} className="text-blue-500" />
                            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                                {searchTerm ? `Search Results in IPFS` : 'IPFS Files'}
                            </h1>
                        </div>
                        {searchTerm ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Found {filteredIpfsFiles.length} {filteredIpfsFiles.length === 1 ? 'result' : 'results'} for "{searchTerm}"</p>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Files stored on the InterPlanetary File System (IPFS)
                            </p>
                        )}
                    </div>

                    {filteredIpfsFiles.length > 0 ? (
                        <div className="border dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 overflow-hidden">
                            <div className="grid grid-cols-12 px-4 py-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300">
                                <div className="col-span-5 flex items-center gap-2">Name</div>
                                <div className="col-span-4 hidden sm:flex items-center gap-2">IPFS Hash</div>
                                <div className="col-span-3 flex items-center justify-end gap-2">Actions</div>
                            </div>

                            {filteredIpfsFiles.map((file) => (
                                <div key={file.id} className="grid grid-cols-12 px-4 py-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                                    <div className="col-span-5 flex items-center gap-2 overflow-hidden">
                                        <span className="truncate dark:text-white">{file.name}</span>
                                    </div>
                                    <div className="col-span-4 hidden sm:flex items-center overflow-hidden">
                                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-md font-mono truncate">
                                            {file.ipfs_hash}
                                        </span>
                                    </div>
                                    <div className="col-span-12 sm:col-span-3 flex items-center justify-end gap-2 pt-2 sm:pt-0">
                                        <button
                                            onClick={() => handleShowDetails(file)}
                                            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                            title="File Details"
                                        >
                                            <Info size={18} />
                                        </button>
                                        <a
                                            href={file.ipfs_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                            title="View on IPFS"
                                        >
                                            <ExternalLink size={18} />
                                        </a>
                                        <a
                                            href={route('files.download', file.id)}
                                            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                            title="Download File"
                                        >
                                            <Download size={18} />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg">
                            <div className="inline-flex rounded-full bg-blue-100 dark:bg-blue-900/30 p-4 mb-4">
                                <Database size={24} className="text-blue-500 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                {searchTerm ? `No IPFS files matching "${searchTerm}"` : 'No IPFS Files Found'}
                            </h3>
                            <p className="mt-2 text-gray-500 dark:text-gray-400">
                                {searchTerm ? 'Try searching for something else.' : 'Upload files to IPFS to see them here.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <FileDetailModal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                file={selectedFile}
            />

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
};

export default IPFSIndex;
