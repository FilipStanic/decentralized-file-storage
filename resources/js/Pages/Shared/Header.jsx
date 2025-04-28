import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Search, LogIn, User, LogOut, X } from 'lucide-react';
import { useSearch } from '../Context/SearchContext.jsx';
import DarkModeToggle from '../Context/DarkModeToggle.jsx';

const MAX_SEARCH_LENGTH = 80;

export const Header = ({
                           isAuthenticated,
                           auth,
                           onUserDropdownToggle
                       }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);
    const { searchTerm, setSearchTerm, handleSearch, clearSearch } = useSearch();

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
    }, [dropdownRef]);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
        onUserDropdownToggle();
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleSearch(searchTerm);
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;

        if (value.length <= MAX_SEARCH_LENGTH) {
            setSearchTerm(value);
            handleSearch(value);
        }
    };

    const handleClearSearch = () => {
        clearSearch();
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    // Create a simple error handler for image loading
    const handleImageError = (e) => {
        // Fallback to default avatar if the profile picture fails to load
        e.target.src = '/images/default/default-avatar.png';
    };

    return (
        <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="relative w-full max-w-md lg:max-w-lg">
                <form onSubmit={handleSearchSubmit}>
                    <div className="relative">
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search BlockStore"
                            className="w-full pl-10 pr-10 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-gray-200"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            maxLength={MAX_SEARCH_LENGTH}
                        />
                        <Search
                            size={18}
                            className="absolute top-2.5 left-3 text-gray-400 dark:text-gray-500"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute top-2.5 right-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                    {searchTerm.length === MAX_SEARCH_LENGTH && (
                        <p className="absolute text-xs text-amber-600 mt-1">
                            Search limit reached ({MAX_SEARCH_LENGTH} characters)
                        </p>
                    )}
                </form>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <DarkModeToggle />

                {isAuthenticated ? (
                    <>
                        <div className="relative" ref={dropdownRef}>
                            <div
                                className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden cursor-pointer"
                                onClick={toggleDropdown}
                            >
                                {auth.user.profile_picture ? (
                                    <img
                                        src={auth.user.profile_picture}
                                        alt={auth.user.name}
                                        className="w-full h-full object-cover"
                                        onError={handleImageError}
                                    />
                                ) : (
                                    <img
                                        src="/images/default/default-avatar.png"
                                        alt={auth.user.name}
                                        className="w-full h-full object-cover"
                                    />
                                )}
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
                    </>
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
