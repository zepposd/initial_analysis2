
import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { DigitizedFile, MetadataTitle } from '../types';
import { performSmartSearch } from '../services/geminiService';
import { downloadFile } from '../services/fileUtils';
import { FileViewModal } from '../components/common/FileViewModal';
import { BackupIcon, CogIcon, DownloadIcon, MergeIcon, RestoreIcon, SparklesIcon, TranslateIcon } from '../components/icons';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { ExportModal } from '../components/common/ExportModal';

export const FilesPage: React.FC<{
    files: DigitizedFile[];
    metadataTitles: MetadataTitle[];
    translatingFileId: string | null;
    onDelete: (id: string) => void;
    onEditFile: (fileId: string) => void;
    onUpdateFile: (fileId: string, updatedData: Partial<Omit<DigitizedFile, 'id'>>) => void;
    onTranslateFile: (fileId: string, language: 'English' | 'Greek') => void;
    onBackup: () => void;
    onRestore: () => void;
    onMerge: () => void;
    onReEvaluateLanguages: (fileIds: string[]) => void;
}> = ({ files, metadataTitles, translatingFileId, onDelete, onEditFile, onUpdateFile, onTranslateFile, onBackup, onRestore, onMerge, onReEvaluateLanguages }) => {
    const [smartSearchQuery, setSmartSearchQuery] = useState('');
    const [smartSearchResults, setSmartSearchResults] = useState<{ id: string; reason: string }[] | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<DigitizedFile | null>(null);
    const [openTranslateMenu, setOpenTranslateMenu] = useState<string | null>(null);
    const [isActionsVisible, setIsActionsVisible] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: 'originalFilename' | 'createdAt' | 'originalLanguage'; direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' });
    const [languageReEvalConfirmation, setLanguageReEvalConfirmation] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [selectedFileIdsForExport, setSelectedFileIdsForExport] = useState<Set<string>>(new Set());


    const displayFiles = useMemo(() => {
        if (smartSearchResults) {
            const resultsMap = new Map(smartSearchResults.map(r => [r.id, r.reason]));
            return files
                .filter(file => resultsMap.has(file.id))
                .map(file => ({ ...file, reason: resultsMap.get(file.id) }));
        }
        return files.map(file => ({ ...file, reason: undefined }));
    }, [files, smartSearchResults]);

    const sortedDisplayFiles = useMemo(() => {
        return [...displayFiles].sort((a, b) => {
            const { key, direction } = sortConfig;
            let aValue: string | number = a[key];
            let bValue: string | number = b[key];
            
            if (key === 'createdAt') {
                aValue = new Date(a.createdAt).getTime();
                bValue = new Date(b.createdAt).getTime();
            }

            if (aValue < bValue) {
                return direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [displayFiles, sortConfig]);

    const handleSort = (key: 'originalFilename' | 'createdAt' | 'originalLanguage') => {
        setSortConfig(prev => {
            if (prev.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };
    
    const generateCsvContent = (filesToExport: DigitizedFile[], allMetadataTitles: MetadataTitle[]): string => {
        const escapeCsvCell = (cellData: any): string => {
            const stringData = String(cellData ?? '').replace(/"/g, '""');
            return `"${stringData}"`;
        };

        const metadataHeaders = allMetadataTitles.map(t => t.name);
        
        const allHeaders = [
            'originalFilename',
            'uploadedBy',
            'createdAt',
            'Σύνοψη',
            'Πρωτότυπο Κείμενο',
            'Πρωτότυπη Γλώσσα',
            'Μετάφραση (Αγγλικά)',
            'Μετάφραση (Ελληνικά)',
            ...metadataHeaders
        ];

        const rows = filesToExport.map(file => {
            const row: (string|number)[] = [];
            
            row.push(escapeCsvCell(file.originalFilename));
            row.push(escapeCsvCell(file.uploadedBy));
            row.push(escapeCsvCell(new Date(file.createdAt).toLocaleString()));
            row.push(escapeCsvCell(file.summary));
            row.push(escapeCsvCell(file.ocrText));
            row.push(escapeCsvCell(file.originalLanguage));
            row.push(escapeCsvCell(file.translationEn));
            row.push(escapeCsvCell(file.translationGr));

            metadataHeaders.forEach(header => {
                row.push(escapeCsvCell(file.metadata[header]));
            });
            
            return row.join(',');
        });

        return [allHeaders.join(','), ...rows].join('\n');
    };

    const handleSmartSearch = async () => {
        if (!smartSearchQuery.trim()) return;
        setIsSearching(true);
        setSearchError(null);
        setSmartSearchResults(null);
        try {
            const results = await performSmartSearch(smartSearchQuery, files);
            setSmartSearchResults(results);
        } catch (e) {
            setSearchError((e as Error).message);
        } finally {
            setIsSearching(false);
        }
    };

    const handleClearSearch = () => {
        setSmartSearchQuery('');
        setSmartSearchResults(null);
        setSearchError(null);
    };

    const handleReEvaluateAllLanguages = () => {
        if (files.length === 0) {
            alert("Δεν υπάρχουν αρχεία για επανεξέταση γλώσσας.");
            return;
        }
        setLanguageReEvalConfirmation(true);
    };

    const handleExportSelected = (format: 'txt' | 'csv' | 'excel') => {
        const filesToExport = files.filter(f => selectedFileIdsForExport.has(f.id));
        if (filesToExport.length === 0) {
            alert("Παρακαλώ επιλέξτε τουλάχιστον ένα αρχείο για εξαγωγή.");
            return;
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        if (format === 'txt') {
            let fullContent = `DocuDigitize AI - Export\n`;
            fullContent += `Exported on: ${new Date().toLocaleString()}\n`;
            fullContent += `Total Files: ${filesToExport.length}\n\n`;

            filesToExport.forEach(file => {
                fullContent += `==================================================\n`;
                fullContent += `FILE: ${file.originalFilename}\n`;
                fullContent += `==================================================\n\n`;
                fullContent += `--- METADATA ---\n`;
                fullContent += `Original Filename: ${file.originalFilename}\n`;
                fullContent += `Uploaded By: ${file.uploadedBy}\n`;
                fullContent += `Created At: ${new Date(file.createdAt).toLocaleString()}\n\n`;
                fullContent += `Metadata:\n${Object.entries(file.metadata).map(([key, value]) => `- ${key}: ${value}`).join('\n')}\n\n`;
                fullContent += `--- SUMMARY (Greek) ---\n${file.summary}\n\n`;
                if(file.translationEn) fullContent += `--- TRANSLATION (English) ---\n${file.translationEn}\n\n`;
                if(file.translationGr) fullContent += `--- TRANSLATION (Greek) ---\n${file.translationGr}\n\n`;
                fullContent += `--- FULL OCR TEXT ---\n${file.ocrText}\n\n\n`;
            });
            downloadFile(fullContent, `DocuDigitize-Export-${timestamp}.txt`, 'text/plain');
        } else if (format === 'csv') {
            const content = generateCsvContent(filesToExport, metadataTitles);
            downloadFile(content, `DocuDigitize-Export-${timestamp}.csv`, 'text/csv');
        } else if (format === 'excel') {
            const filesForExcel = filesToExport.filter(f => f.archiveStatus === 'keep');
            if (filesForExcel.length === 0) {
                alert("Δεν υπάρχουν επιλεγμένα αρχεία που να διατηρούνται στο αρχείο για εξαγωγή.");
                return;
            }
            
            const data = filesForExcel.map(file => ({
                'Όνομα Αρχείου': file.originalFilename,
                'Χρήστης': file.uploadedBy,
                'Ημερομηνία Εισαγωγής': new Date(file.createdAt).toLocaleDateString()
            }));

            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Export");
            XLSX.writeFile(workbook, `DocuDigitize-Excel-Export-${timestamp}.xlsx`);
        }

        setIsExportModalOpen(false);
        setSelectedFileIdsForExport(new Set());
    };
    
    const SortableHeader: React.FC<{
        label: string;
        sortKey: 'originalFilename' | 'createdAt' | 'originalLanguage';
    }> = ({ label, sortKey }) => (
        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-[#8B949E] uppercase tracking-wider">
            <button className="flex items-center gap-1" onClick={() => handleSort(sortKey)}>
                {label}
                {sortConfig.key === sortKey && (
                    <span>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                )}
            </button>
        </th>
    );


    return (
        <div className="p-8">
            {languageReEvalConfirmation && (
                <ConfirmationDialog
                    title="Επιβεβαίωση Επανεξέτασης Γλώσσας"
                    message={`Είστε βέβαιοι ότι θέλετε να γίνει επανεξέταση της πρωτότυπης γλώσσας για ΟΛΑ τα ${files.length} αρχεία; Αυτή η ενέργεια θα έχει επιπλέον κόστος κλήσεων API.`}
                    confirmText="Ναι, Επανεξέταση Γλώσσας"
                    cancelText="Άκυρο"
                    onConfirm={() => {
                        onReEvaluateLanguages(files.map(f => f.id));
                        setLanguageReEvalConfirmation(false);
                    }}
                    onCancel={() => setLanguageReEvalConfirmation(false)}
                />
            )}
             <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => {
                    setIsExportModalOpen(false);
                    setSelectedFileIdsForExport(new Set());
                }}
                files={files}
                selectedIds={selectedFileIdsForExport}
                onSelectionChange={(id) => {
                    setSelectedFileIdsForExport(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(id)) {
                            newSet.delete(id);
                        } else {
                            newSet.add(id);
                        }
                        return newSet;
                    });
                }}
                onSelectAll={(checked) => {
                    if (checked) {
                        setSelectedFileIdsForExport(new Set(files.map(f => f.id)));
                    } else {
                        setSelectedFileIdsForExport(new Set());
                    }
                }}
                onExport={handleExportSelected}
            />
            <h1 className="text-2xl font-bold mb-4">Αρχεία Κειμένου</h1>
            <div className="mb-6 bg-secondary dark:bg-[#161B22] p-4 rounded-lg border border-border-color dark:border-[#30363D]">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        placeholder="Ρωτήστε οτιδήποτε για τα αρχεία σας..."
                        value={smartSearchQuery}
                        onChange={e => setSmartSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !isSearching && handleSmartSearch()}
                        className="w-full bg-primary dark:bg-[#0D1117] border border-border-color dark:border-[#30363D] rounded-md px-3 py-2 text-text-primary dark:text-[#C9D1D9] focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-[#58A6FF]"
                    />
                    <button 
                        onClick={handleSmartSearch}
                        disabled={isSearching || !smartSearchQuery}
                        className="flex items-center justify-center bg-accent text-white font-bold py-2 px-4 rounded-md hover:bg-blue-500 dark:hover:bg-blue-400 transition duration-300 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        <SparklesIcon className="w-5 h-5 mr-2" />
                        {isSearching ? "Αναζήτηση..." : "Έξυπνη Αναζήτηση"}
                    </button>
                </div>
                {searchError && <p className="text-red-500 text-sm mt-2">{searchError}</p>}
            </div>

            <div className="my-6 bg-secondary dark:bg-[#161B22] p-4 rounded-lg border border-border-color dark:border-[#30363D]">
                <button onClick={() => setIsActionsVisible(!isActionsVisible)} className="font-semibold text-lg text-accent dark:text-[#58A6FF] w-full text-left flex justify-between items-center">
                    <span>Μαζικές Ενέργειες</span>
                    <span className="text-2xl">{isActionsVisible ? '−' : '+'}</span>
                </button>
                {isActionsVisible && (
                    <div className="mt-4 pt-4 border-t border-border-color dark:border-[#30363D] space-y-4">
                         <div className="flex justify-between items-center">
                             <h3 className="text-md font-semibold text-text-primary dark:text-[#C9D1D9]">Επανεξέταση Γλώσσας</h3>
                             <button onClick={handleReEvaluateAllLanguages} className="bg-teal-600 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-500">
                                Επανεξέταση Γλώσσας ΟΛΩΝ ({files.length})
                            </button>
                         </div>
                    </div>
                )}
            </div>

            {smartSearchResults && (
                <div className="mb-4 flex justify-between items-center">
                    <h2 className="text-lg font-semibold">
                        ✨ Έξυπνα Αποτελέσματα Αναζήτησης ({displayFiles.length} βρέθηκαν)
                    </h2>
                    <button onClick={handleClearSearch} className="text-accent dark:text-[#58A6FF] hover:underline text-sm">
                        Καθαρισμός Αναζήτησης
                    </button>
                </div>
            )}
            <div className="bg-secondary dark:bg-[#161B22] border border-border-color dark:border-[#30363D] rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-border-color dark:divide-[#30363D]">
                    <thead className="bg-primary dark:bg-[#0D1117]">
                        <tr>
                            <SortableHeader label="Filename" sortKey="originalFilename" />
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-[#8B949E] uppercase tracking-wider">Κατάσταση & Χρήστης</th>
                            <SortableHeader label="Date" sortKey="createdAt" />
                            <SortableHeader label="Original Language" sortKey="originalLanguage" />
                            <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary dark:text-[#8B949E] uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color dark:divide-[#30363D]">
                        {sortedDisplayFiles.map(file => (
                            <React.Fragment key={file.id}>
                                <tr className={`transition-colors ${file.archiveStatus === 'exclude' ? 'bg-red-50 dark:bg-red-900/20 opacity-60' : 'hover:bg-primary dark:hover:bg-[#0D1117]'}`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary dark:text-[#C9D1D9] font-medium">
                                         <button onClick={() => onEditFile(file.id)} className="text-accent dark:text-[#58A6FF] hover:underline text-left truncate">
                                            {file.originalFilename}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <select
                                            value={file.archiveStatus}
                                            onChange={(e) => onUpdateFile(file.id, { archiveStatus: e.target.value as 'keep' | 'exclude' })}
                                            className="text-xs rounded-md border-border-color dark:border-[#30363D] bg-secondary dark:bg-[#161B22] text-text-secondary dark:text-[#8B949E] focus:ring-accent dark:focus:ring-[#58A6FF] p-1"
                                            onClick={e => e.stopPropagation()}
                                            >
                                            <option value="keep">Διατηρείται στο αρχείο</option>
                                            <option value="exclude">Εξαιρείται από το αρχείο</option>
                                            </select>
                                            <span className="text-xs text-text-secondary dark:text-[#8B949E] bg-primary dark:bg-[#0D1117] px-2 py-1 rounded-full">{file.uploadedBy}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-[#8B949E]">{new Date(file.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-[#8B949E]">{file.originalLanguage}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button onClick={() => setSelectedFile(file)} className="text-accent dark:text-[#58A6FF] hover:underline">View</button>
                                            <div className="relative inline-block">
                                                <button 
                                                    onClick={() => setOpenTranslateMenu(openTranslateMenu === file.id ? null : file.id)} 
                                                    className="p-1 rounded-full hover:bg-primary dark:hover:bg-[#0D1117] disabled:opacity-50"
                                                    disabled={translatingFileId === file.id}
                                                    title="Translate"
                                                >
                                                    {translatingFileId === file.id ? <CogIcon className="w-5 h-5 animate-spin"/> : <TranslateIcon className="w-5 h-5 text-purple-500 dark:text-purple-400" />}
                                                </button>
                                                {openTranslateMenu === file.id && (
                                                    <div className="absolute right-0 bottom-full mb-2 w-32 bg-primary dark:bg-[#0D1117] border border-border-color dark:border-[#30363D] rounded-md shadow-lg z-20">
                                                        <button onClick={() => { onTranslateFile(file.id, 'English'); setOpenTranslateMenu(null); }} className="block w-full text-left px-3 py-2 text-sm text-text-primary dark:text-[#C9D1D9] hover:bg-secondary dark:hover:bg-[#161B22]">to English</button>
                                                        <button onClick={() => { onTranslateFile(file.id, 'Greek'); setOpenTranslateMenu(null); }} className="block w-full text-left px-3 py-2 text-sm text-text-primary dark:text-[#C9D1D9] hover:bg-secondary dark:hover:bg-[#161B22]">to Greek</button>
                                                    </div>
                                                )}
                                            </div>
                                            <button onClick={() => onDelete(file.id)} className="text-red-500 hover:underline">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                                {file.reason && (
                                    <tr className={`bg-primary/50 dark:bg-[#0D1117]/50 ${file.archiveStatus === 'exclude' ? 'opacity-60' : ''}`}>
                                        <td colSpan={5} className="px-6 py-2">
                                            <div className="flex items-center text-xs text-yellow-600 dark:text-yellow-300/80 italic">
                                                <SparklesIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                                                <span><strong>Λόγος αντιστοίχισης:</strong> {file.reason}</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
             <div className="mt-6 flex justify-end items-center gap-4 flex-wrap">
                <button onClick={onBackup} className="bg-secondary dark:bg-[#161B22] text-text-primary dark:text-[#C9D1D9] font-semibold py-2 px-4 rounded-md border border-border-color dark:border-[#30363D] hover:bg-border-color dark:hover:bg-[#30363D] transition duration-300 flex items-center gap-2">
                    <BackupIcon className="w-5 h-5" />
                    Εφεδρικό Αντίγραφο
                </button>
                <button onClick={onMerge} className="bg-green-600 dark:bg-green-800 text-white font-bold py-2 px-4 rounded-md hover:bg-green-500 dark:hover:bg-green-700 transition duration-300 flex items-center gap-2">
                    <MergeIcon className="w-5 h-5" />
                    Συγχώνευση
                </button>
                <button onClick={onRestore} className="bg-orange-600 dark:bg-orange-800 text-white font-bold py-2 px-4 rounded-md hover:bg-orange-500 dark:hover:bg-orange-700 transition duration-300 flex items-center gap-2">
                    <RestoreIcon className="w-5 h-5" />
                    Επαναφορά
                </button>
                <button onClick={() => setIsExportModalOpen(true)} className="bg-teal-600 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-500 transition duration-300 flex items-center gap-2">
                    <DownloadIcon className="w-5 h-5" />
                    Εξαγωγή Αρχείων
                </button>
            </div>
            <FileViewModal file={selectedFile} onClose={() => setSelectedFile(null)} />
        </div>
    );
};