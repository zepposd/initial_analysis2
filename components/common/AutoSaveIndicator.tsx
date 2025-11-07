
import React from 'react';
import { CogIcon, CheckIcon } from '../icons';

export const AutoSaveIndicator: React.FC<{ status: 'idle' | 'pending' | 'saving' | 'saved' }> = ({ status }) => {
    switch (status) {
        case 'pending':
            return <div className="flex items-center justify-end text-sm text-yellow-500 dark:text-yellow-400 italic gap-2 h-5"><p>Changes pending...</p></div>;
        case 'saving':
            return <div className="flex items-center justify-end text-sm text-accent dark:text-[#58A6FF] italic gap-2 h-5"><CogIcon className="w-4 h-4 animate-spin" /><span>Saving...</span></div>;
        case 'saved':
            return <div className="flex items-center justify-end text-sm text-green-600 dark:text-green-400 italic gap-2 h-5"><CheckIcon className="w-4 h-4" /><span>All changes saved</span></div>;
        default:
            return <div className="h-5"></div>; // Placeholder to prevent layout shift
    }
};
