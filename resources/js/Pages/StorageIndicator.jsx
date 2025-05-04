import React, { useState, useEffect } from 'react';
import { HardDrive, Database } from 'lucide-react';
import axios from 'axios';

const StorageIndicator = () => {
    const [storageData, setStorageData] = useState({
        local: { used: '0 B', percentage: 0, limit: '50.00 GB' },
        ipfs:  { used: '0 B', percentage: 0, limit: '1.00 GB'  }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStorageData = async () => {
            try {
                const { data } = await axios.get(route('storage.stats'));
                setStorageData(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchStorageData();
        const id = setInterval(fetchStorageData, 5 * 60 * 1000);
        return () => clearInterval(id);
    }, []);

    const getProgressColor = pct => {
        if (pct < 70) return 'bg-indigo-600';
        if (pct < 90) return 'bg-amber-500';
        return 'bg-red-600';
    };

    const getVisiblePercentage = (percentage) => {
        return percentage <= 0 ? 0.5 : Math.max(0.5, percentage);
    };

    if (loading) {
        return (
            <div className="p-4 border-t dark:border-gray-700 space-y-4">
                <div>
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1 h-5">
                        <div className="flex items-center">
                            <HardDrive size={14} className="mr-1" />
                            <span>Local Storage</span>
                        </div>
                        <span className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 animate-pulse" />
                </div>

                <div>
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1 h-5">
                        <div className="flex items-center">
                            <Database size={14} className="mr-1" />
                            <span>IPFS Storage</span>
                        </div>
                        <span className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="mt-auto p-4 border-t dark:border-gray-700 space-y-4">
            <div>
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <div className="flex items-center gap-1">
                        <HardDrive size={14} />
                        <span>Local Storage</span>
                    </div>
                    <span className="whitespace-nowrap ml-2">
                        <span className="mr-1">{storageData.local.used}</span>of<span className="ml-1">{storageData.local.limit}</span>
                    </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                        className={`h-2 rounded-full ${getProgressColor(storageData.local.percentage)} transition-all duration-300`}
                        style={{ width: `${getVisiblePercentage(storageData.local.percentage)}%` }}
                    />
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <div className="flex items-center gap-1">
                        <Database size={14} />
                        <span>IPFS Storage</span>
                    </div>
                    <span className="whitespace-nowrap ml-2">
                        <span className="mr-1">{storageData.ipfs.used}</span>of<span className="ml-1">{storageData.ipfs.limit}</span>
                    </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                        className={`h-2 rounded-full ${getProgressColor(storageData.ipfs.percentage)} transition-all duration-300`}
                        style={{ width: `${getVisiblePercentage(storageData.ipfs.percentage)}%` }}
                    />
                </div>
                {storageData.ipfs.percentage >= 70 && (
                    <div className="mt-2 text-xs text-right">
                        <span className={storageData.ipfs.percentage >= 90 ? 'text-red-500' : 'text-amber-500'}>
                            {storageData.ipfs.percentage >= 90
                                ? 'IPFS storage almost full!'
                                : 'IPFS storage usage is high'}
                        </span>
                    </div>
                )}
            </div>


        </div>
    );
};

export default StorageIndicator;