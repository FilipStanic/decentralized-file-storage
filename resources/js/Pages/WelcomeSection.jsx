import React, { useState, useRef } from 'react';
import { Link } from '@inertiajs/react';
import { FilePlus, LogIn, UserPlus, File } from 'lucide-react';

export const WelcomeSection = ({
                                   isAuthenticated,
                                   onCreateNew
                               }) => {
    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleFileUpload = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
            <div className="text-center max-w-xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div className="w-24 h-24 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-white text-4xl font-bold">B</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Welcome to BlockStore
                </h1>

                {!isAuthenticated ? (
                    <div className="space-y-4">
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Secure, decentralized file storage that gives you complete control over your data.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link
                                href={route('login')}
                                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                            >
                                <LogIn size={20} /> Sign In
                            </Link>
                            <Link
                                href={route('register')}
                                className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                            >
                                <UserPlus size={20} /> Register
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />

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
                            {file ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-3">
                                        <File size={24} className="text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                                        <FilePlus size={24} className="text-gray-500 dark:text-gray-400" />
                                    </div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        Drop your file here, or <button
                                        type="button"
                                        onClick={handleFileUpload}
                                        className="text-indigo-600 dark:text-indigo-400"
                                    >
                                        browse
                                    </button>
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Maximum file size: 100MB
                                    </p>
                                </div>
                            )}
                        </div>

                        {file && (
                            <div className="flex justify-center gap-4 mt-4">
                                <button
                                    type="button"
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                                    onClick={() => setFile(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                    onClick={() => onCreateNew(file)}
                                >
                                    Upload
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                    {!isAuthenticated ? "Already know BlockStore? " : "Need help getting started? "}
                    <a
                        href="#"
                        className="text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400"
                    >
                        Learn More
                    </a>
                </div>
            </div>
        </div>
    );
};

export default WelcomeSection;
