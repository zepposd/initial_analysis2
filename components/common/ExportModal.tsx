
import React from 'react';
import { DigitizedFile } from '../../types';
import { DownloadIcon } from '../icons';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    files: DigitizedFile[];
    selectedIds: Set<string>;
    onSelectionChange: (id: string) => void;
    onSelectAll: (checked: boolean) => void;
    onExport: (format: 'txt' | 'csv' | 'excel') => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, files, selectedIds, onSelectionChange, onSelectAll, onExport }) => {
    if (!isOpen) return null;

    const allSelected = files.length > 0 && selectedIds.size === files.length;
    const isExportDisabled = selectedIds.size === 0;

    return (
        <div 
            className="fixed inset-0 bg-primary/90 dark:bg-[#0D1117]/95 flex items-center justify-center z-50 p-4" 
            onClick={onClose}
        >
            <div 
                className="bg-secondary dark:bg-[#161B22] p-6 rounded-lg shadow-xl w-full max-w-6xl xl:w-3/4 border border-border-color dark:border-[#30363D] flex flex-col max-h-[90vh]" 
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-text-primary dark:text-[#C9D1D9]">Εξαγωγή Αρχείων</h2>
                    <button onClick={onClose} className="text-2xl font-bold leading-none p-1 rounded-full hover:bg-primary dark:hover:bg-[#0D1117]">&times;</button>
                </div>

                {/* Modal Content */}
                <div className="flex-grow flex flex-col overflow-hidden">
                    <div className="bg-primary dark:bg-[#0D1117] p-3 rounded-lg border border-border-color dark:border-[#30363D] mb-4 flex-shrink-0">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="form-checkbox bg-secondary dark:bg-[#161B22] border-border-color dark:border-[#30363D] text-accent dark:text-[#58A6FF] rounded focus:ring-accent"
                                checked={allSelected}
                                onChange={(e) => onSelectAll(e.target.checked)}
                                disabled={files.length === 0}
                            />
                            <span className="ml-3 font-semibold text-text-primary dark:text-[#C9D1D9]">
                                {allSelected ? 'Αποεπιλογή Όλων' : 'Επιλογή Όλων'} ({selectedIds.size} / {files.length})
                            </span>
                        </label>
                    </div>

                    <div className="flex-grow overflow-y-auto space-y-3 pr-4 -mr-4">
                        {files.length > 0 ? (
                            files.map(file => (
                                <label key={file.id} className="block cursor-pointer p-4 rounded-lg hover:bg-primary dark:hover:bg-[#0D1117] border border-transparent hover:border-border-color dark:hover:border-[#30363D] transition-colors">
                                    <div className="flex items-start gap-4">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox bg-secondary dark:bg-[#161B22] border-border-color dark:border-[#30363D] text-accent dark:text-[#58A6FF] rounded focus:ring-accent flex-shrink-0 mt-1"
                                            checked={selectedIds.has(file.id)}
                                            onChange={() => onSelectionChange(file.id)}
                                        />
                                        <div className="flex-grow grid md:grid-cols-3 gap-x-6 gap-y-2 items-start">
                                            <div className="md:col-span-1">
                                                <p className="font-semibold text-text-primary dark:text-[#C9D1D9]" title={file.originalFilename}>
                                                    {file.originalFilename}
                                                </p>
                                                <p className="text-xs text-text-secondary dark:text-[#8B949E] font-mono mt-1">
                                                    {new Date(file.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <div className="bg-primary/80 dark:bg-[#0D1117]/80 p-3 rounded-md border border-border-color/50 dark:border-[#30363D]/50 text-sm text-text-secondary dark:text-[#8B949E] whitespace-pre-wrap break-words">
                                                    {file.summary || "Δεν υπάρχει διαθέσιμη σύνοψη."}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            ))
                        ) : (
                            <p className="text-center text-sm text-text-secondary dark:text-[#8B949E] italic py-4">Δεν υπάρχουν αρχεία για εξαγωγή.</p>
                        )}
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 mt-4 border-t border-border-color dark:border-[#30363D] flex-shrink-0">
                     <button onClick={onClose} className="w-full sm:w-auto bg-primary dark:bg-[#0D1117] text-text-primary dark:text-[#C9D1D9] px-6 py-2 rounded-md border border-border-color dark:border-[#30363D] hover:bg-border-color dark:hover:bg-[#30363D]">
                        Άκυρο
                    </button>
                    <button
                        onClick={() => onExport('txt')}
                        disabled={isExportDisabled}
                        className="w-full sm:w-auto flex items-center justify-center bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-500 transition duration-300 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        <DownloadIcon className="w-5 h-5 mr-2" />
                        Εξαγωγή (.txt)
                    </button>
                    <button
                        onClick={() => onExport('csv')}
                        disabled={isExportDisabled}
                        className="w-full sm:w-auto flex items-center justify-center bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-500 transition duration-300 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        <DownloadIcon className="w-5 h-5 mr-2" />
                        Εξαγωγή (.csv)
                    </button>
                    <button
                        onClick={() => onExport('excel')}
                        disabled={isExportDisabled}
                        className="w-full sm:w-auto flex items-center justify-center bg-emerald-700 text-white font-bold py-2 px-4 rounded-md hover:bg-emerald-600 transition duration-300 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        <DownloadIcon className="w-5 h-5 mr-2" />
                        Εξαγωγή (.xlsx)
                    </button>
                </div>
            </div>
        </div>
    );
};