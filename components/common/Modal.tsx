
import React from 'react';

export const Modal: React.FC<{ children: React.ReactNode, title: string, onClose?: () => void }> = ({ children, title, onClose }) => (
    <div className="fixed inset-0 bg-primary dark:bg-dark-primary bg-opacity-90 dark:bg-opacity-95 flex items-center justify-center z-50">
        <div className="bg-secondary dark:bg-[#161B22] p-8 rounded-lg shadow-xl w-full max-w-md border border-border-color dark:border-[#30363D]">
            <h2 className="text-2xl font-bold text-center text-text-primary dark:text-[#C9D1D9] mb-4">{title}</h2>
            {children}
        </div>
    </div>
);
