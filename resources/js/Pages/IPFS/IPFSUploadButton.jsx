import React, { useState } from 'react';
import { Database, Trash } from 'lucide-react';
import axios from 'axios';

const IPFSUploadButton = ({ fileId, isOnIPFS, onSuccess, buttonSize = 'normal' }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const uploadToIPFS = () => {
        setLoading(true);
        setError(null);

        axios.post(route('ipfs.upload', fileId), {}, {
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            }
        })
            .then(response => {
                setLoading(false);
                if (onSuccess && typeof onSuccess === 'function') {
                    onSuccess(response.data);
                }
                window.location.reload();
            })
            .catch(error => {
                setLoading(false);
                const errorMessage = error.response?.data?.message || 'Failed to upload to IPFS';
                setError(errorMessage);
                console.error('IPFS upload error:', error);

                if (error.response?.status === 403) {
                    setError('Permission denied. You may not have access to this file.');
                }
            });
    };

    const removeFromIPFS = () => {
        setLoading(true);
        setError(null);

        axios.post(route('ipfs.remove', fileId), {}, {
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            }
        })
            .then(response => {
                setLoading(false);
                if (onSuccess && typeof onSuccess === 'function') {
                    onSuccess(response.data);
                }
                window.location.reload();
            })
            .catch(error => {
                setLoading(false);
                const errorMessage = error.response?.data?.message || 'Failed to remove from IPFS';
                setError(errorMessage);
                console.error('IPFS removal error:', error);

                if (error.response?.status === 403) {
                    setError('Permission denied. You may not have access to this file.');
                }
            });
    };

    const sizes = {
        small: {
            button: "px-2 py-1 text-xs",
            icon: 14
        },
        normal: {
            button: "px-3 py-1.5 text-sm",
            icon: 16
        },
        large: {
            button: "px-4 py-2 text-base",
            icon: 18
        }
    };

    const sizeClass = sizes[buttonSize] || sizes.normal;

    if (isOnIPFS) {
        return (
            <div>
                <button
                    onClick={removeFromIPFS}
                    disabled={loading}
                    className={`flex items-center gap-1 ${sizeClass.button} bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50`}
                    title="Remove from IPFS"
                >
                    {loading ? (
                        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                        <Trash size={sizeClass.icon} />
                    )}
                    <span>Remove from IPFS</span>
                </button>
                {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>}
            </div>
        );
    }

    return (
        <div>
            <button
                onClick={uploadToIPFS}
                disabled={loading}
                className={`flex items-center gap-1 ${sizeClass.button} bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50`}
                title="Upload to IPFS"
            >
                {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                ) : (
                    <Database size={sizeClass.icon} />
                )}
                <span>Upload to IPFS</span>
            </button>
            {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>}
        </div>
    );
};

export default IPFSUploadButton;