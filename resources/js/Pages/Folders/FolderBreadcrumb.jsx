import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

const FolderBreadcrumb = ({ breadcrumbs = [] }) => {
    return (
        <div className="flex items-center overflow-x-auto whitespace-nowrap my-4 pb-2">
            <Link href={route('folders.show')} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Folders
            </Link>
            {breadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={breadcrumb.id}>
                    <ChevronRight size={16} className="mx-1 text-gray-400" />
                    <Link
                        href={route('folders.show', breadcrumb.id)}
                        className={`${index === breadcrumbs.length - 1 ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        {breadcrumb.name}
                    </Link>
                </React.Fragment>
            ))}
        </div>
    );
};

export default FolderBreadcrumb;
