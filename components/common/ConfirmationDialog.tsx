
import React from 'react';
import { Modal } from './Modal';

export const ConfirmationDialog: React.FC<{
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
}> = ({ title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel" }) => (
    <Modal title={title}>
        <p className="text-center text-text-secondary dark:text-[#8B949E] mb-6">{message}</p>
        <div className="flex justify-center space-x-4">
            <button onClick={onCancel} className="bg-primary dark:bg-[#0D1117] text-text-primary dark:text-[#C9D1D9] px-6 py-2 rounded-md border border-border-color dark:border-[#30363D] hover:bg-border-color dark:hover:bg-[#30363D]">{cancelText}</button>
            <button onClick={onConfirm} className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-500">{confirmText}</button>
        </div>
    </Modal>
);


export const BackupOnLogoutModal: React.FC<{
  onBackupAndLogout: () => void;
  onLogout: () => void;
  onCancel: () => void;
}> = ({ onBackupAndLogout, onLogout, onCancel }) => (
    <Modal title="Δημιουργία Αντιγράφου Ασφαλείας;">
        <p className="text-center text-text-secondary dark:text-[#8B949E] mb-6">Θέλετε να δημιουργήσετε ένα εφεδρικό αντίγραφο των δεδομένων σας πριν αποσυνδεθείτε;</p>
        <div className="flex flex-col space-y-3">
             <button onClick={onBackupAndLogout} className="w-full bg-accent text-white font-bold px-6 py-2 rounded-md hover:bg-blue-500">
                Backup και Έξοδος
            </button>
            <button onClick={onLogout} className="w-full bg-secondary dark:bg-[#161B22] text-text-primary dark:text-[#C9D1D9] px-6 py-2 rounded-md border border-border-color dark:border-[#30363D] hover:bg-border-color dark:hover:bg-[#30363D]">
                Έξοδος χωρίς Backup
            </button>
            <button onClick={onCancel} className="w-full text-text-secondary dark:text-[#8B949E] mt-2 hover:underline">
                Άκυρο
            </button>
        </div>
    </Modal>
);
