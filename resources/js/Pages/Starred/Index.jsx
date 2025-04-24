import React from 'react';
import { Head } from '@inertiajs/react';
import Sidebar from '@/Pages/Sidebar';
import Header from '@/Pages/Header';
import StarredItems from '@/Pages/StarredItems';

export default function Index({ auth, starredFiles, starredFolders }) {
    const isAuthenticated = auth && auth.user;

    return (
        <>
            <Head title="Starred Items" />

            <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                <Sidebar expanded={true} onCreateNew={() => {}} />

                <div className="flex-1 p-4 overflow-auto bg-gray-50 dark:bg-gray-900">
                    <Header
                        isAuthenticated={isAuthenticated}
                        auth={auth}
                        onUserDropdownToggle={() => {}}
                    />

                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                            Starred Items
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Your favorite files and folders in one place
                        </p>
                    </div>

                    {starredFolders.length > 0 && (
                        <StarredItems items={starredFolders} type="folders" />
                    )}

                    <StarredItems items={starredFiles} type="files" />
                </div>
            </div>
        </>
    );
}
