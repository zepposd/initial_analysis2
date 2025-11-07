

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { DigitizedFile, MetadataTitle, User } from '../types';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { FileViewModal } from '../components/common/FileViewModal';
import { CogIcon, FileTextIcon, TrashIcon, UploadIcon } from '../components/icons';
import { processImageAndSummarize } from '../services/geminiService';
import { fileToBase64, calculateFileHash } from '../services/fileUtils';


export const UploadPage: React.FC<{
  user: User;
  allFiles: DigitizedFile[];
  metadataTitles: MetadataTitle[];
  onFileUpload: (file: Omit<DigitizedFile, 'id'>) => void;
  onFileUpdate: (fileId: string, updatedData: Partial<Omit<DigitizedFile, 'id'>>) => void;
  onDeleteFile: (id: string) => void;
  onAuthError: () => void;
}> = ({ user, allFiles, metadataTitles, onFileUpload, onFileUpdate, onDeleteFile, onAuthError }) => {
    const [fileQueue, setFileQueue] = useState<File[]>([]);
    const [currentFileIndex, setCurrentFileIndex] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<{ ocrText: string; summary: string; metadata: Record<string, string>; originalLanguage: string; } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [metadata, setMetadata] = useState<Record<string, string>>({});
    const [viewingFile, setViewingFile] = useState<DigitizedFile | null>(null);
    
    const [duplicateFile, setDuplicateFile] = useState<DigitizedFile | null>(null);
    const [replacementMode, setReplacementMode] = useState<string | null>(null);
    
    const currentFile = useMemo(() => fileQueue[currentFileIndex] || null, [fileQueue, currentFileIndex]);
    const isLastFile = currentFileIndex === fileQueue.length - 1;

    const resetState = useCallback(() => {
        setFileQueue([]);
        setCurrentFileIndex(0);
        setResult(null);
        setMetadata({});
        setDuplicateFile(null);
        setReplacementMode(null);
        setError(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
    }, []);
    
    const processNextFile = useCallback(() => {
        setResult(null);
        setMetadata({});
        setDuplicateFile(null);
        setReplacementMode(null);
        setError(null);
        setCurrentFileIndex(prev => prev + 1);
    }, []);

    const handleProcessFile = useCallback(async (isReplacement: boolean = false) => {
        if (!currentFile) return;

        let fileHash = '';
        if (!isReplacement) {
            fileHash = await calculateFileHash(currentFile);
            const existingFile = allFiles.find(f => f.contentHash === fileHash);
            if (existingFile) {
                setDuplicateFile(existingFile);
                return;
            }
        }
        
        setIsProcessing(true);
        setError(null);
        setResult(null);
        try {
            const base64 = await fileToBase64(currentFile);
            const titles = metadataTitles.map(t => t.name);
            const response = await processImageAndSummarize(base64, currentFile.type, titles);
            
            response.metadata = { ...response.metadata, ...(isReplacement ? { contentHash: fileHash } : {}) };

            setResult(response);
            setMetadata(response.metadata || {});
        } catch (e) {
            if ((e as Error).message.includes("Invalid Gemini API Key")) {
              onAuthError();
            } else {
              setError((e as Error).message);
            }
        } finally {
            setIsProcessing(false);
        }
    }, [currentFile, allFiles, metadataTitles, onAuthError]);

    useEffect(() => {
        if (currentFile && !isProcessing && !result && !duplicateFile && !error) {
            handleProcessFile();
        }
    }, [currentFile, result, isProcessing, duplicateFile, error, handleProcessFile]);

    const handleFilesSelected = (files: FileList | null) => {
        if (files && files.length > 0) {
            const newFiles = Array.from(files).filter(f => ['image/png', 'image/jpeg', 'application/pdf'].includes(f.type));
            
            if (newFiles.length !== files.length) {
                setError("Ορισμένα αρχεία είχαν μη έγκυρους τύπους και αγνοήθηκαν. Παρακαλώ ανεβάστε PNG, JPG, ή PDF.");
            } else {
                setError(null);
            }

            if (newFiles.length === 0) return;

            if (fileQueue.length === 0) {
                setFileQueue(newFiles);
                setCurrentFileIndex(0);
            } else {
                setFileQueue(prev => [...prev, ...newFiles]);
            }
        }
    };

    const handleDuplicateConfirm = () => {
        if (!duplicateFile) return;
        setReplacementMode(duplicateFile.id);
        setDuplicateFile(null);
        handleProcessFile(true);
    };

    const handleMetadataChange = (title: string, value: string) => {
        setMetadata(prev => ({...prev, [title]: value}));
    };
    
    const handleSaveAndContinue = async () => {
        if (!currentFile || !result) return;
        const fileHash = await calculateFileHash(currentFile);

        const fileData = {
            originalFilename: currentFile.name,
            contentHash: fileHash,
            ocrText: result.ocrText,
            summary: result.summary,
            metadata,
            originalLanguage: result.originalLanguage,
            createdAt: new Date().toISOString(),
            apiCalls: 1,
            // New/placeholder fields
            uploadedBy: user.name,
            archiveStatus: 'keep' as const,
            categories: [],
            classificationGoal: '',
        };

        if (replacementMode) {
            onFileUpdate(replacementMode, fileData);
        } else {
            onFileUpload(fileData);
        }

        if (isLastFile) {
            resetState();
        } else {
            processNextFile();
        }
    };

    const recentFiles = useMemo(() => {
        return [...allFiles].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
    }, [allFiles]);

  return (
      <div className="p-8 space-y-8">
          {duplicateFile && (
              <ConfirmationDialog
                  title="Διπλότυπο Αρχείο"
                  message={`Αυτό το αρχείο φαίνεται να είναι διπλότυπο του "${duplicateFile.originalFilename}". Θέλετε να αντικαταστήσετε το υπάρχον αρχείο ή να ακυρώσετε;`}
                  onConfirm={handleDuplicateConfirm}
                  onCancel={() => { setDuplicateFile(null); isLastFile ? resetState() : processNextFile(); }}
                  confirmText="Αντικατάσταση"
                  cancelText="Ακύρωση"
              />
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-secondary dark:bg-[#161B22] p-6 rounded-lg border border-border-color dark:border-[#30363D] space-y-4">
                <h2 className="text-xl font-bold text-text-primary dark:text-[#C9D1D9]">1. Ανέβασμα Αρχείων</h2>
                 <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); handleFilesSelected(e.dataTransfer.files); }}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex justify-center items-center w-full h-48 border-2 border-dashed border-border-color dark:border-[#30363D] rounded-lg cursor-pointer hover:bg-primary dark:hover:bg-[#0D1117]"
                >
                    <div className="text-center">
                        <UploadIcon className="mx-auto h-12 w-12 text-text-secondary dark:text-[#8B949E]" />
                        <p className="mt-2 text-sm text-text-secondary dark:text-[#8B949E]">Σύρετε και αποθέστε ή κάντε κλικ για να επιλέξετε</p>
                        <input ref={fileInputRef} type="file" className="hidden" accept=".png,.jpg,.jpeg,.pdf" multiple onChange={(e) => handleFilesSelected(e.target.files)} />
                    </div>
                </div>
                
                {currentFile && (
                    <div className="bg-primary dark:bg-[#0D1117] p-3 rounded-md">
                        <div className="flex items-center">
                            {isProcessing ? <CogIcon className="w-5 h-5 text-accent dark:text-[#58A6FF] animate-spin mr-3 flex-shrink-0" /> : <FileTextIcon className="w-5 h-5 text-text-secondary dark:text-[#8B949E] mr-3 flex-shrink-0"/>}
                            <p className="text-text-secondary dark:text-[#8B949E] truncate">{isProcessing ? 'Επεξεργασία:' : 'Τρέχον αρχείο:'} {currentFile.name}</p>
                        </div>
                        {fileQueue.length > 1 && (
                            <div className="text-right text-xs text-text-secondary dark:text-[#8B949E] mt-1">
                                Αρχείο {currentFileIndex + 1} από {fileQueue.length}
                            </div>
                        )}
                    </div>
                )}


                {error && <p className="text-red-500">{error}</p>}
                
                <div className="pt-4 mt-4 border-t border-border-color dark:border-[#30363D]">
                    <h3 className="font-semibold mb-2 text-text-primary dark:text-[#C9D1D9]">Πρόσφατα Αρχεία</h3>
                    {recentFiles.length > 0 ? (
                        <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                            {recentFiles.map(f => (
                                <li key={f.id} className="flex justify-between items-center bg-primary dark:bg-[#0D1117] p-2 rounded-md text-sm">
                                    <button onClick={() => setViewingFile(f)} className="text-accent dark:text-[#58A6FF] hover:underline truncate pr-4 text-left">{f.originalFilename}</button>
                                    <button onClick={() => onDeleteFile(f.id)} title="Delete file">
                                        <TrashIcon className="w-4 h-4 text-red-600 hover:text-red-500" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-text-secondary dark:text-[#8B949E] italic">Δεν υπάρχουν πρόσφατα αρχεία.</p>
                    )}
                </div>
            </div>
            
            <div className="bg-secondary dark:bg-[#161B22] p-6 rounded-lg border border-border-color dark:border-[#30363D] space-y-4">
                <h2 className="text-xl font-bold text-text-primary dark:text-[#C9D1D9]">2. Αποτελέσματα AI</h2>
                {isProcessing && <div className="text-center p-8"><p>Ανάλυση αρχείου...</p></div>}
                {result && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">Σύνοψη (Ελληνικά)</h3>
                            <p className="bg-primary dark:bg-[#0D1117] p-3 rounded-md text-sm text-text-secondary dark:text-[#8B949E]">{result.summary}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Εξαγόμενο Κείμενο (OCR)</h3>
                            <textarea
                                readOnly
                                value={result.ocrText}
                                className="w-full h-40 bg-primary dark:bg-[#0D1117] p-3 rounded-md text-sm text-text-secondary dark:text-[#8B949E] border border-border-color dark:border-[#30363D]"
                            />
                        </div>
                    </div>
                )}
                 {!isProcessing && !result && currentFile && !duplicateFile && (
                    <div className="text-center p-8 text-text-secondary dark:text-[#8B949E]">
                        <p>Παρουσιάστηκε σφάλμα κατά την επεξεργασία. Παρακαλώ δοκιμάστε ξανά.</p>
                        <button onClick={() => handleProcessFile()} className="mt-2 text-accent dark:text-[#58A6FF] hover:underline">Επανάληψη</button>
                    </div>
                 )}
            </div>
        </div>

        {result && (
            <div className="bg-secondary dark:bg-[#161B22] p-6 rounded-lg border border-border-color dark:border-[#30363D] space-y-6">
                 <h2 className="text-xl font-bold text-text-primary dark:text-[#C9D1D9]">3. Μεταδεδομένα</h2>
                 <div>
                    <h3 className="font-semibold mb-2">Μεταδεδομένα</h3>
                    <div className="space-y-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                         <div>
                            <label className="text-sm font-medium text-text-secondary/70 dark:text-[#8B949E]/70 block mb-1">Original Filename</label>
                            <input
                                type="text"
                                value={currentFile?.name || ''}
                                readOnly
                                className="w-full bg-primary dark:bg-[#0D1117] border-0 rounded-md px-3 py-2 text-text-primary/70 dark:text-[#C9D1D9]/70 cursor-default"
                            />
                        </div>
                         <div>
                            <label className="text-sm font-medium text-text-secondary/70 dark:text-[#8B949E]/70 block mb-1">Πρωτότυπη γλώσσα κειμένου</label>
                            <input
                                type="text"
                                value={result.originalLanguage || 'Unknown'}
                                readOnly
                                className="w-full bg-primary dark:bg-[#0D1117] border-0 rounded-md px-3 py-2 text-text-primary/70 dark:text-[#C9D1D9]/70 cursor-default"
                            />
                        </div>
                        {metadataTitles.map(title => (
                            <div key={title.id}>
                                <label className="text-sm font-medium text-text-secondary dark:text-[#8B949E] block mb-1 capitalize">{title.name.charAt(0).toUpperCase() + title.name.slice(1).toLowerCase()}</label>
                                <input
                                    type="text"
                                    value={metadata[title.name] || ''}
                                    onChange={(e) => handleMetadataChange(title.name, e.target.value)}
                                    className="w-full bg-primary dark:bg-[#0D1117] border border-border-color dark:border-[#30363D] rounded-md px-3 py-2 text-text-primary dark:text-[#C9D1D9] focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-[#58A6FF]"
                                />
                            </div>
                        ))}
                    </div>
                </div>
                 <button
                    onClick={handleSaveAndContinue}
                    className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-500 transition duration-300"
                >
                    {isLastFile ? 'Αποθήκευση' : 'Αποθήκευση & Συνέχεια'}
                </button>
            </div>
        )}
        <FileViewModal file={viewingFile} onClose={() => setViewingFile(null)} />
      </div>
  );
};