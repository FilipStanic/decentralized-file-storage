import React, { useState, useRef, useEffect } from "react";
import { Search, Plus, LogIn, User, LogOut, Settings, File, FileText, Image, FilePlus, Folder,
    MoreVertical, Download, Share2, Trash2, Star, X, Moon, Sun } from "lucide-react";
import { Link, useForm } from "@inertiajs/react";
import { useTheme } from '@/Components/ThemeProvider';

const getFileIcon = (type) => {
    switch (type) {
        case 'Image':
            return <Image className="text-green-500" />;
        case 'PDF':
            return <FileText className="text-red-500" />;
        case 'Spreadsheet':
            return <FileText className="text-emerald-500" />;
        case 'Presentation':
            return <FileText className="text-orange-500" />;
        case 'Document':
            return <FileText className="text-blue-500" />;
        default:
            return <File className="text-gray-500" />;
    }
};

export const HomePage = ({ auth, recentFiles = [], quickAccessFiles = [] }) => {
    const [expanded, setExpanded] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const dropdownRef = useRef(null);
    const modalRef = useRef(null);
    const fileInputRef = useRef(null);
    const isAuthenticated = auth && auth.user;
    const { darkMode, toggleTheme } = useTheme();

    // Inertia form for file uploads
    const { data, setData, post, processing, progress, errors, reset } = useForm({
        file: null,
    });

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
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

    const handleCreateNew = () => {
        setShowUploadModal(true);
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
        e.preventDefault();
        post(route('files.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setShowUploadModal(false);
                reset();
            },
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

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <div className="w-60 border-r dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800">
                <Link href={route('home')} className="p-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white">B</span>
                    </div>
                    <h1 className="font-bold text-lg dark:text-white">BlockStore</h1>
                </Link>

                <div className="px-4 py-2">
                    <button
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md w-full"
                        onClick={handleCreateNew}
                    >
                        <Plus size={16} />
                        <span>Upload File</span>
                    </button>
                </div>

                <div className="mt-4">
                    <h2 className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">Files</h2>
                    <div className="px-4 py-1 flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                        <span className="text-gray-800 dark:text-gray-200">My files</span>
                    </div>

                    {expanded && (
                        <>
                            <div className="px-4 py-1 pl-8 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer">
                                Analytics
                            </div>
                            <div className="px-4 py-1 pl-8 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer">
                                Assets
                            </div>
                            <div className="px-4 py-1 pl-8 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer">
                                Encrypted
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-auto p-4 border-t dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">0 GB of 50 GB used</div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-indigo-600 h-2 rounded-full w-0"></div>
                    </div>
                    <button className="text-indigo-600 dark:text-indigo-400 text-sm mt-2">Upgrade</button>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 p-4 overflow-auto bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-between mb-8">
                    <div className="relative w-96">
                        <input
                            type="text"
                            placeholder="Search BlockStore"
                            className="w-full pl-10 pr-4 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-gray-200"
                        />
                        <Search
                            size={18}
                            className="absolute top-2.5 left-3 text-gray-400 dark:text-gray-500"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                <button className="px-4 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200">
                                    Upgrade
                                </button>
                                <div className="relative" ref={dropdownRef}>
                                    <div
                                        className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden cursor-pointer"
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                    >
                                        {auth.user.profile_photo_path ? (
                                            <img
                                                src={auth.user.profile_photo_path}
                                                alt={auth.user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-gray-600 dark:text-gray-300 font-medium">
                                                {auth.user.name.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>

                                    {/* Dropdown menu */}
                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border dark:border-gray-700">
                                            <div className="px-4 py-2 border-b dark:border-gray-700">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{auth.user.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{auth.user.email}</p>
                                            </div>

                                            <Link
                                                href={route('profile.edit')}
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <User size={16} className="mr-2" />
                                                Profile
                                            </Link>

                                            <button
                                                onClick={toggleTheme}
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                            >
                                                {darkMode ? (
                                                    <>
                                                        <Sun size={16} className="mr-2" />
                                                        Light Mode
                                                    </>
                                                ) : (
                                                    <>
                                                        <Moon size={16} className="mr-2" />
                                                        Dark Mode
                                                    </>
                                                )}
                                            </button>

                                            <Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                            >
                                                <LogOut size={16} className="mr-2" />
                                                Log Out
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href={route('login')}
                                    className="flex items-center gap-1 px-4 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    <LogIn size={16} />
                                    <span>Sign In</span>
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="px-4 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {isAuthenticated && (
                    <>
                        {/* Quick access section */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-medium dark:text-white">Quick access</h2>
                            </div>

                            {quickAccessFiles.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {quickAccessFiles.map((file) => (
                                        <div
                                            key={file.id}
                                            className="p-4 border dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow flex flex-col bg-white dark:bg-gray-800"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                                    {getFileIcon(file.type)}
                                                </div>
                                                <Link
                                                    as="button"
                                                    href={route('files.toggle-star', file.id)}
                                                    method="post"
                                                    className="text-gray-400 hover:text-yellow-400"
                                                >
                                                    <Star size={18} fill={file.starred ? "currentColor" : "none"} className={file.starred ? "text-yellow-400" : ""} />
                                                </Link>
                                            </div>
                                            <h3 className="font-medium text-gray-900 dark:text-white mb-1 truncate">{file.name}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{file.date}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg">
                                    <p className="text-gray-500 dark:text-gray-400">No quick access files yet. Files you use frequently will appear here.</p>
                                </div>
                            )}
                        </div>

                        {/* Recent files section */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-medium dark:text-white">Recent</h2>
                            </div>

                            {recentFiles.length > 0 ? (
                                <div className="border dark:border-gray-700 rounded-md overflow-hidden bg-white dark:bg-gray-800">
                                    <div className="grid grid-cols-12 px-4 py-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300">
                                        <div className="col-span-5 md:col-span-6 flex items-center gap-2">
                                            Name
                                        </div>
                                        <div className="col-span-3 md:col-span-2 hidden sm:flex items-center gap-2">
                                            Size
                                        </div>
                                        <div className="col-span-2 md:col-span-2 hidden md:flex items-center gap-2">
                                            Modified
                                        </div>
                                        <div className="col-span-7 sm:col-span-4 md:col-span-2 flex items-center justify-end gap-2">
                                            Actions
                                        </div>
                                    </div>

                                    {recentFiles.map((file) => (
                                        <div key={file.id} className="grid grid-cols-12 px-4 py-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                                            <div className="col-span-5 md:col-span-6 flex items-center gap-2">
                                                <div className="flex-shrink-0">
                                                    {getFileIcon(file.type)}
                                                </div>
                                                <span className="truncate dark:text-white">{file.name}</span>
                                            </div>
                                            <div className="col-span-3 md:col-span-2 hidden sm:flex items-center text-gray-600 dark:text-gray-400">
                                                {file.size}
                                            </div>
                                            <div className="col-span-2 md:col-span-2 hidden md:flex items-center text-gray-600 dark:text-gray-400">
                                                {file.lastModified}
                                            </div>
                                            <div className="col-span-7 sm:col-span-4 md:col-span-2 flex items-center justify-end gap-1">
                                                <Link
                                                    href={route('files.download', file.id)}
                                                    className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                                >
                                                    <Download size={18} />
                                                </Link>
                                                <Link
                                                    as="button"
                                                    href={route('files.toggle-star', file.id)}
                                                    method="post"
                                                    className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded"
                                                >
                                                    <Star size={18} fill={file.starred ? "currentColor" : "none"} className={file.starred ? "text-yellow-400" : ""} />
                                                </Link>
                                                <Link
                                                    href={route('files.destroy', file.id)}
                                                    method="delete"
                                                    as="button"
                                                    className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                                >
                                                    <Trash2 size={18} />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg">
                                    <p className="text-gray-500 dark:text-gray-400">No files yet. Upload files to see them here.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div
                        ref={modalRef}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4"
                    >
                        <div className="flex justify-between items-center border-b dark:border-gray-700 px-6 py-4">
                            <h3 className="text-lg font-medium dark:text-white">Upload File</h3>
                            <button onClick={() => {setShowUploadModal(false); reset();}} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="px-6 py-4">
                                <div
                                    className={`border-2 border-dashed rounded-lg p-8 text-center ${
                                        dragActive
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                            : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                    onDragEnter={handleDrag}
                                    onDragOver={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />

                                    {data.file ? (
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-3">
                                                <File size={24} className="text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <p className="font-medium text-gray-900 dark:text-white">{data.file.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{(data.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                                                <FilePlus size={24} className="text-gray-500 dark:text-gray-400" />
                                            </div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                Drop your file here, or <button type="button" onClick={handleFileUpload} className="text-indigo-600 dark:text-indigo-400">browse</button>
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Maximum file size: 100MB</p>
                                        </div>
                                    )}
                                </div>

                                {errors.file && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.file}</p>}

                                {progress && (
                                    <div className="mt-4">
                                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                            Uploading... {typeof progress === 'number' ? progress : progress.percentage}%
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-indigo-600 h-2 rounded-full"
                                                style={{ width: `${typeof progress === 'number' ? progress : progress.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-2 border-t dark:border-gray-700 px-6 py-4">
                                <button
                                    type="button"
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                                    onClick={() => {setShowUploadModal(false); reset();}}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!data.file || processing}
                                >
                                    {processing ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;
