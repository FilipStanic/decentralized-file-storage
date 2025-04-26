import React from 'react';
import { Database } from 'lucide-react';

const IPFSStatus = ({ isOnIPFS, className = '' }) => {
    if (!isOnIPFS) return null;

    return (
        <div className={`flex items-center gap-1 text-xs text-blue-500 dark:text-blue-400 ${className}`}>
            <Database size={14} />
            <span>IPFS</span>
        </div>
    );
};

export default IPFSStatus;
