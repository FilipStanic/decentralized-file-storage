import React, { useState, useRef, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Search, LogIn, User, LogOut, X } from 'lucide-react';

export const Header = ({
                           isAuthenticated,
                           auth,
                           onSearch,
                           searchTerm = '',
                           setSearchTerm
                       }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (onSearch) onSearch(searchTerm);
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (onSearch) onSearch(value);
    };

    return (
        <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="relative w-full max-w-md lg:max-w-lg">
                <form onSubmit={handleSearch}>
                    <div className="relative">
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search"
                            className="w-full pl-10 pr-10 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-gray-200"
                            value={searchTerm}
                            onChange={handleChange}
                        />
                        <Search size={18} className="absolute top-2.5 left-3 text-gray-400 dark:text-gray-500" />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchTerm('');
                                    if (onSearch) onSearch('');
                                    searchInputRef.current?.focus();
                                }}
                                className="absolute top-2.5 right-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                {isAuthenticated ? (
                    <div className="relative" ref={dropdownRef}>
                        <div
                            className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden cursor-pointer"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                            <span className="text-gray-600 dark:text-gray-300 font-medium">
                                {auth.user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>

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
                ) : (
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('login')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                        >
                            <LogIn size={14} />
                            <span className="hidden sm:inline">Sign In</span>
                        </Link>
                        <Link
                            href={route('register')}
                            className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200 text-sm"
                        >
                            Register
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Header;
