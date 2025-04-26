import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeContext';

const DarkModeToggle = ({ className = '' }) => {
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${className}`}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
            {darkMode ? (
                <Sun size={20} className="text-yellow-400" />
            ) : (
                <Moon size={20} className="text-gray-700" />
            )}
        </button>
    );
};

export default DarkModeToggle;
