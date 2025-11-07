
import React from 'react';
import { Modal } from './Modal';
import { WarningIcon } from '../icons';

export const InitialLoadModal: React.FC<{
    onContinue: () => void;
    onLoadBackup: () => void;
}> = ({ onContinue, onLoadBackup }) => {
    return (
        <Modal title="Καλώς ήρθατε">
            <p className="text-center text-text-secondary dark:text-[#8B949E] mb-6">
                Θέλετε να φορτώσετε προηγούμενες ρυθμίσεις και αρχεία από ένα εφεδρικό αντίγραφο (.json);
            </p>

            <div className="flex flex-col space-y-3">
                <button 
                    onClick={onLoadBackup} 
                    className="w-full bg-accent text-white font-bold px-6 py-2 rounded-md hover:bg-blue-500"
                >
                    Φόρτωση Backup
                </button>
                <button 
                    onClick={onContinue} 
                    className="w-full bg-secondary dark:bg-[#161B22] text-text-primary dark:text-[#C9D1D9] px-6 py-2 rounded-md border border-border-color dark:border-[#30363D] hover:bg-border-color dark:hover:bg-[#30363D]"
                >
                    Συνέχεια χωρίς φόρτωση
                </button>
            </div>
        </Modal>
    );
};