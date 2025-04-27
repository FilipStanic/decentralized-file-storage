import React from 'react';
import { useForm } from '@inertiajs/react';

export default function UpdateProfilePictureForm({ className, auth }) {
    const { data, setData, post, progress, errors, processing } = useForm({
        profile_picture: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('profile.picture.update'), {
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
            <div>
                <label htmlFor="profile_picture" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Profile Picture
                </label>
                <div className="flex items-center gap-4">
                    {auth.user.profile_picture ? (
                        <img
                            src={auth.user.profile_picture}
                            alt="Profile"
                            className="w-16 h-16 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 dark:text-gray-300 font-medium text-lg">
                                {auth.user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <input
                        type="file"
                        id="profile_picture"
                        name="profile_picture"
                        accept="image/*"
                        onChange={(e) => setData('profile_picture', e.target.files[0])}
                        className="mt-1 block w-full text-sm text-gray-900 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-gray-300 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 dark:file:bg-gray-700 dark:file:text-gray-300 dark:hover:file:bg-gray-600"
                    />
                </div>
                {errors.profile_picture && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.profile_picture}</p>
                )}
            </div>

            {progress && (
                <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
                    <div
                        className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full"
                        style={{ width: `${progress.percentage}%` }}
                    >
                        {progress.percentage}%
                    </div>
                </div>
            )}

            <div className="flex items-center gap-4">
                <button
                    type="submit"
                    disabled={processing}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-offset-gray-800 disabled:opacity-25 transition ease-in-out duration-150"
                >
                    Upload
                </button>
            </div>
        </form>
    );
}