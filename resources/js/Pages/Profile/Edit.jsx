import { Head, Link } from '@inertiajs/react';
import React from 'react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdateProfilePictureForm from '@/Pages/Profile/UpdateProfilePictureForm';
import DarkModeToggle from '@/Pages/Context/DarkModeToggle';

export default function Edit({ auth, mustVerifyEmail, status }) {
    return (
        <>
            <Head title="Profile" />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <header className="bg-white dark:bg-gray-800 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <Link href={route('home')} className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-white">B</span>
                                </div>
                                <h1 className="font-bold text-lg dark:text-white">BlockStore</h1>
                            </Link>

                            <div className="flex items-center gap-4">
                                <DarkModeToggle />
                                <Link href={route('home')} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm">
                                    &larr; Back to Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="py-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Account Settings</h1>

                    <div className="space-y-8">
                        <section id="profile">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="max-w-xl"
                            />
                        </section>

                        <section id="profile-picture">
                            <UpdateProfilePictureForm auth={auth} className="max-w-xl" />
                        </section>

                        <section id="password">
                            <UpdatePasswordForm className="max-w-xl" />
                        </section>

                        <section id="delete">
                            <DeleteUserForm className="max-w-xl" />
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}