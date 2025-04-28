import React, { useState, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import axios from 'axios';

export default function UpdateProfilePictureForm({ className, auth }) {
    const [previewUrl, setPreviewUrl] = useState(auth.user.profile_picture);
    const [isRemoving, setIsRemoving] = useState(false);
    const fileInputRef = useRef(null);

    const { data, setData, post, progress, errors, processing, reset } = useForm({
        profile_picture: null,
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('profile_picture', file);

            // Create a preview URL for the selected image
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrl(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('profile.picture.update'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                // Leave the preview URL as is since it now shows the uploaded image
            },
        });
    };

    const handleSelectImage = () => {
        fileInputRef.current?.click();
    };

    const handleRemoveImage = async () => {
        if (confirm('Are you sure you want to remove your profile picture?')) {
            setIsRemoving(true);
            try {
                const response = await axios.post(route('profile.picture.remove'));
                if (response.data.success) {
                    // Reset the preview to the default avatar
                    setPreviewUrl('/storage/profile_pictures/default-avatar.png');
                    // Force a reload to update all instances of the profile picture
                    window.location.reload();
                }
            } catch (error) {
                console.error('Error removing profile picture:', error);
                alert('Failed to remove profile picture. Please try again.');
            } finally {
                setIsRemoving(false);
            }
        }
    };

    // Check if user has a custom profile picture (not the default one)
    const hasCustomProfilePicture = !auth.user.profile_picture.includes('default-avatar.png');

    return (
        <div className={`p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Profile Picture</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                    <div className="flex-shrink-0">
                        <div className="relative">
                            <img
                                src={previewUrl || auth.user.profile_picture}
                                alt={auth.user.name}
                                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                            />
                            <button
                                type="button"
                                onClick={handleSelectImage}
                                className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full shadow-md hover:bg-indigo-700"
                                title="Change profile picture"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        <input
                            type="file"
                            id="profile_picture"
                            name="profile_picture"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        <div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                Upload a new profile picture. Images should be square for best results.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={handleSelectImage}
                                    className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md font-semibold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150"
                                >
                                    Select Image
                                </button>

                                {hasCustomProfilePicture && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        disabled={isRemoving}
                                        className="inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md font-semibold text-xs text-red-700 dark:text-red-400 uppercase tracking-widest hover:bg-red-200 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150 disabled:opacity-50"
                                    >
                                        {isRemoving ? 'Removing...' : 'Remove Image'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {data.profile_picture && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Selected: {data.profile_picture.name}
                            </div>
                        )}

                        {errors.profile_picture && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.profile_picture}</p>
                        )}
                    </div>
                </div>

                {progress && (
                    <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700 mt-4">
                        <div
                            className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full"
                            style={{ width: `${progress.percentage}%` }}
                        >
                            {progress.percentage}%
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-end">
                    <button
                        type="submit"
                        disabled={!data.profile_picture || processing}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-25 transition ease-in-out duration-150"
                    >
                        {processing ? 'Uploading...' : 'Update Picture'}
                    </button>
                </div>
            </form>
        </div>
    );
}
