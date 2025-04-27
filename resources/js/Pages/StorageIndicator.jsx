import React, { useState, useEffect } from 'react';
import { HardDrive, Database } from 'lucide-react';
import axios from 'axios';

const StorageIndicator = () => {
    const [storageData, setStorageData] = useState({
        local: {
            used: '0 B',
            percentage: 0,
            limit: '50.00 GB'
        },
        ipfs: {
            used: '0 B',
            percentage: 0,
            limit: '1.00 GB'
        }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStorageData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(route('storage.stats'));
                setStorageData(response.data);
            } catch (error) {
                console.error('Error fetching storage data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStorageData();

        // Refresh data every 5 minutes
        const interval = setInterval(fetchStorageData, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    const getProgressColor = (percentage) => {
        if (percentage < 70) return 'bg-indigo-600';
        if (percentage < 90) return 'bg-amber-500';
        return 'bg-red-600';
    };

    if (loading) {
        return (
            <div className="p-4 border-t dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Loading storage information...</div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 animate-pulse">
                    <div className="bg-gray-400 h-2 rounded-full w-10"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-auto p-4 border-t dark:border-gray-700 space-y-4">
            {/* Local Storage */}
            <div>
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <div className="flex items-center">
                        <HardDrive size={14} className="mr-1" />
                        <span>Local Storage</span>
                    </div>
                    <span>{storageData.local.used} of {storageData.local.limit}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full ${getProgressColor(storageData.local.percentage)}`}
                        style={{ width: `${storageData.local.percentage}%` }}
                    ></div>
                </div>
            </div>

            {/* IPFS Storage */}
            <div>
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <div className="flex items-center">
                        <Database size={14} className="mr-1" />
                        <span>IPFS Storage</span>
                    </div>
                    <span>{storageData.ipfs.used} of {storageData.ipfs.limit}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full ${getProgressColor(storageData.ipfs.percentage)}`}
                        style={{ width: `${storageData.ipfs.percentage}%` }}
                    ></div>
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {storageData.ipfs.percentage >= 90 ? (
                        <span className="text-red-500">IPFS storage almost full!</span>
                    ) : storageData.ipfs.percentage >= 70 ? (
                        <span className="text-amber-500">IPFS storage usage is high</span>
                    ) : (
                        <div className="flex justify-end"><a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">Upgrade</a></div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StorageIndicator;
