

import React, { useState, useEffect, useRef } from 'react';
import { Page, User, DigitizedFile, Category, MetadataTitle, Subcategory, CategoryRawInput, MetadataRawInput, ClassificationGoalSnapshot, CategorySettingsSnapshot, MetadataSettingsSnapshot } from './types';
import Navbar from './components/Navbar';
import UserGuide from './components/UserGuide';
import { useMockData } from './hooks/useMockData';
import { useDebounce } from './hooks/useDebounce';
import { translateText, reEvaluateLanguage, initializeAiClient } from './services/geminiService';
import { downloadFile } from './services/fileUtils';

// Import Page Components
import { UploadPage } from './pages/UploadPage';
import { FilesPage } from './pages/FilesPage';
import { EditFilePage } from './pages/EditFilePage';
import { SettingsPage } from './pages/SettingsPage';

// Import Common Components
import { Modal } from './components/common/Modal';
import { ConfirmationDialog, BackupOnLogoutModal } from './components/common/ConfirmationDialog';
import { ApiKeyModal } from './components/common/ApiKeyModal';
import { InitialLoadModal } from './components/common/InitialLoadModal';
import { UserNamePromptModal } from './components/common/UserNamePromptModal';

type BackupV1Data = {
    files?: DigitizedFile[];
    categories?: Category[];
    metadataTitles?: MetadataTitle[];
    categoryRawInputs?: CategoryRawInput[];
    metadataRawInputs?: MetadataRawInput[];
    categorySettingsHistory?: CategorySettingsSnapshot[];
    metadataSettingsHistory?: MetadataSettingsSnapshot[];
    classificationGoal?: string;
    classificationGoalHistory?: ClassificationGoalSnapshot[];
};
type BackupV1File = {
    version: 1;
    createdAt: string;
    data: BackupV1Data;
};


export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('upload');
  const mockData = useMockData();
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('theme') as 'light' | 'dark') || 'dark'
  );
  
  // API Key Management
  const [isApiKeyNeeded, setIsApiKeyNeeded] = useState(false);
  const [apiKeyError, setApiKeyError] = useState('');
  
  // State for app-wide features
  const [isReEvaluatingLanguage, setIsReEvaluatingLanguage] = useState(false);
  const [reEvaluateLanguageProgress, setReEvaluateLanguageProgress] = useState({ current: 0, total: 0 });
  const [translatingFileId, setTranslatingFileId] = useState<string | null>(null);
  const [translatingLanguage, setTranslatingLanguage] = useState<'English' | 'Greek' | null>(null);
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [restoreFileContent, setRestoreFileContent] = useState<string | null>(null);
  const [mergeFileContent, setMergeFileContent] = useState<string | null>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);
  const mergeInputRef = useRef<HTMLInputElement>(null);
  const [showBackupOnLogout, setShowBackupOnLogout] = useState(false);
  const [showInitialLoadPrompt, setShowInitialLoadPrompt] = useState(false);

  // Auto-saving state for metadata
  const [metadataSaveStatus, setMetadataSaveStatus] = useState<'idle' | 'pending' | 'saving' | 'saved'>('idle');

  // Debounce settings changes
  const debouncedMetadataTitles = useDebounce(mockData.metadataTitles, 1500);

  // Unsaved changes detection baseline
  const [initialMetadata, setInitialMetadata] = useState<string | null>(null);

   useEffect(() => {
    const key = sessionStorage.getItem('gemini_api_key');
    if (key) {
      try {
        initializeAiClient(key);
        setIsApiKeyNeeded(false);
      } catch (error) {
        console.error("Failed to initialize with stored API key:", error);
        sessionStorage.removeItem('gemini_api_key');
        setIsApiKeyNeeded(true);
      }
    } else {
      setIsApiKeyNeeded(true);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  
  useEffect(() => {
    setInitialMetadata(JSON.stringify(mockData.metadataTitles));
  }, []); 

  useEffect(() => {
    if (initialMetadata && JSON.stringify(mockData.metadataTitles) !== initialMetadata) {
        setMetadataSaveStatus('pending');
    }
  }, [mockData.metadataTitles, initialMetadata]);
  
  useEffect(() => {
    const stringifiedDebouncedMetadata = JSON.stringify(debouncedMetadataTitles);
    if (initialMetadata && stringifiedDebouncedMetadata !== initialMetadata) {
        setMetadataSaveStatus('saving');
        mockData.saveMetadataTitlesSnapshot();
        setInitialMetadata(stringifiedDebouncedMetadata); 
        setTimeout(() => {
            setMetadataSaveStatus('saved');
            setTimeout(() => setMetadataSaveStatus('idle'), 2000);
        }, 500); 
    }
  }, [debouncedMetadataTitles, initialMetadata, mockData]);

  const hasUnsavedSettings = metadataSaveStatus === 'pending';
  
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedSettings) {
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedSettings]);

  const handleAuthError = () => {
    sessionStorage.removeItem('gemini_api_key');
    setIsApiKeyNeeded(true);
    alert("Your Gemini API key appears to be invalid or has expired. Please enter a new one.");
  };

  const handleApiKeySubmit = (key: string) => {
    try {
      initializeAiClient(key);
      sessionStorage.setItem('gemini_api_key', key);
      setIsApiKeyNeeded(false);
      setApiKeyError('');
    } catch (error) {
      console.error("Invalid API Key provided:", error);
      setApiKeyError('An error occurred while initializing the API key. Please ensure it is a valid key.');
    }
  };

  const handleLogin = (loggedInUser: User) => {
    const userExists = mockData.users.some(u => u.name.toLowerCase() === loggedInUser.name.trim().toLowerCase());
    if (!userExists) {
        mockData.addUser(loggedInUser.name);
    }
    setUser(loggedInUser);
    if (!sessionStorage.getItem('initialPromptDismissed')) {
        setShowInitialLoadPrompt(true);
    }
  };
  
  const handleLogout = () => {
    if (hasUnsavedSettings) {
        if (!confirm("Έχετε μη αποθηκευμένες αλλαγές. Είστε βέβαιοι ότι θέλετε να βγείτε; Οι αλλαγές θα χαθούν.")) {
            return;
        }
    }
    setShowBackupOnLogout(true);
  };

  const handleStartEditFile = (fileId: string) => {
      setEditingFileId(fileId);
  };

  const handleCancelEditFile = () => {
      setEditingFileId(null);
  };

  const handleSaveFile = (fileId: string, updatedData: Partial<Omit<DigitizedFile, 'id'>>) => {
      mockData.updateFile(fileId, updatedData);
      setEditingFileId(null);
  };

  const handleTranslateFile = async (fileId: string, language: 'English' | 'Greek') => {
        const file = mockData.files.find(f => f.id === fileId);
        if (!file) return;

        setTranslatingFileId(fileId);
        setTranslatingLanguage(language);
        try {
            const translatedText = await translateText(file.ocrText, language);
            if (language === 'English') {
                mockData.updateFile(fileId, { translationEn: translatedText });
            } else {
                mockData.updateFile(fileId, { translationGr: translatedText });
            }
        } catch (error) {
            console.error("Translation failed", error);
            if ((error as Error).message.includes("Invalid Gemini API Key")) {
                handleAuthError();
            } else {
                alert("Translation failed. Please check the console for details.");
            }
        } finally {
            setTranslatingFileId(null);
            setTranslatingLanguage(null);
        }
    };

    const handleReEvaluateLanguages = async (fileIds: string[]) => {
      if (fileIds.length === 0) {
          alert('Δεν υπάρχουν επιλεγμένα αρχεία για επανεξέταση γλώσσας.');
          return;
      }

      setIsReEvaluatingLanguage(true);
      setReEvaluateLanguageProgress({ current: 0, total: fileIds.length });
      
      const filesToProcess = mockData.files.filter(f => fileIds.includes(f.id));

      for (const file of filesToProcess) {
          try {
              const newLanguage = await reEvaluateLanguage(file.ocrText);
              mockData.updateFile(file.id, { originalLanguage: newLanguage });
          } catch (error) {
              console.error(`Failed to re-evaluate language for file ${file.originalFilename}:`, error);
              if ((error as Error).message.includes("Invalid Gemini API Key")) {
                  handleAuthError();
                  setIsReEvaluatingLanguage(false);
                  return;
              }
              mockData.updateFile(file.id, { originalLanguage: 'Σφάλμα' });
          } finally {
              setReEvaluateLanguageProgress(prev => ({ ...prev, current: prev.current + 1 }));
          }
      }

      setIsReEvaluatingLanguage(false);
      alert(`Η επανεξέταση γλώσσας για ${fileIds.length} αρχεία ολοκληρώθηκε.`);
  };

    const handleBackup = () => {
        const filesToBackup = mockData.files.filter(f => f.archiveStatus === 'keep');
        const backupData: BackupV1File = {
            version: 1,
            createdAt: new Date().toISOString(),
            data: {
                files: filesToBackup,
                // Placeholders for compatibility
                categories: mockData.categories,
                classificationGoal: mockData.classificationGoal,
                categoryRawInputs: mockData.categoryRawInputs,
                categorySettingsHistory: mockData.categorySettingsHistory,
                classificationGoalHistory: mockData.classificationGoalHistory,
                // Active data
                metadataTitles: mockData.metadataTitles,
                metadataRawInputs: mockData.metadataRawInputs,
                metadataSettingsHistory: mockData.metadataSettingsHistory,
            }
        };
        const jsonString = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `DocuDigitize-Backup-${timestamp}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleRestoreUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result;
                if (typeof text === 'string') {
                    setRestoreFileContent(text);
                }
            };
            reader.readAsText(file);
        }
        if (event.target) {
            event.target.value = '';
        }
    };

    const handleConfirmRestore = () => {
        if (!restoreFileContent) return;
        try {
            const backupData: BackupV1File = JSON.parse(restoreFileContent);
            if (backupData.version === 1 && backupData.data) {
                // Restore only relevant data for this app version
                mockData.setFiles(backupData.data.files || []);
                mockData.setMetadataTitles(backupData.data.metadataTitles || []);
                mockData.setMetadataRawInputs(backupData.data.metadataRawInputs || []);
                mockData.setMetadataSettingsHistory(backupData.data.metadataSettingsHistory || []);
                
                // For compatibility, also set the placeholder data
                mockData.setCategories(backupData.data.categories || []);
                mockData.setCategoryRawInputs(backupData.data.categoryRawInputs || []);
                mockData.setCategorySettingsHistory(backupData.data.categorySettingsHistory || []);
                mockData.setClassificationGoal(backupData.data.classificationGoal || '');
                mockData.setClassificationGoalHistory(backupData.data.classificationGoalHistory || []);
                
                setInitialMetadata(JSON.stringify(backupData.data.metadataTitles || []));
                
                alert('Η επαναφορά ολοκληρώθηκε με επιτυχία!');
            } else {
                throw new Error('Μη έγκυρη ή μη υποστηριζόμενη μορφή αρχείου αντιγράφου ασφαλείας.');
            }
        } catch (error) {
            console.error("Restore failed:", error);
            alert(`Η επαναφορά απέτυχε: ${(error as Error).message}`);
        } finally {
            setRestoreFileContent(null);
        }
    };

    const handleMergeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result;
                if (typeof text === 'string') {
                    setMergeFileContent(text);
                }
            };
            reader.readAsText(file);
        }
        if (event.target) {
            event.target.value = '';
        }
    };
    
    const handleConfirmMerge = () => {
        if (!mergeFileContent) return;
        try {
            const backupData: BackupV1File = JSON.parse(mergeFileContent);
            if (!(backupData.version === 1 && backupData.data)) {
                 throw new Error('Μη έγκυρη ή μη υποστηριζόμενη μορφή αρχείου αντιγράφου ασφαλείας.');
            }
            
            let mergeSummary = [];

            // Merge Files
            const currentFileHashes = new Set(mockData.files.map(f => f.contentHash));
            const newFiles = (backupData.data.files || []).filter((f: DigitizedFile) => !currentFileHashes.has(f.contentHash));
            if (newFiles.length > 0) {
                mockData.setFiles(prev => [...prev, ...newFiles]);
                mergeSummary.push(`${newFiles.length} new files`);
            }
            
            // Merge Metadata Titles
            const currentTitleNames = new Set(mockData.metadataTitles.map(t => t.name.toLowerCase()));
            const newTitles = (backupData.data.metadataTitles || []).filter((t: MetadataTitle) => !currentTitleNames.has(t.name.toLowerCase()));
            if (newTitles.length > 0) {
                const totalTitles = [...mockData.metadataTitles, ...newTitles];
                mockData.setMetadataTitles(totalTitles);
                setInitialMetadata(JSON.stringify(totalTitles));
                mergeSummary.push(`${newTitles.length} new metadata titles`);
            }
            
            const mergeHistory = <T extends {id: string}>(currentHistory: T[], backupHistory: T[] | undefined): [T[], number] => {
                if (!backupHistory) return [currentHistory, 0];
                const currentIds = new Set(currentHistory.map(item => item.id));
                const newItems = backupHistory.filter(item => !currentIds.has(item.id));
                return [[...currentHistory, ...newItems], newItems.length];
            }

            const [totalMetaRaw, newMetaRaw] = mergeHistory<MetadataRawInput>(mockData.metadataRawInputs, backupData.data.metadataRawInputs);
             if (newMetaRaw > 0) {
                mockData.setMetadataRawInputs(totalMetaRaw);
                mergeSummary.push(`${newMetaRaw} new metadata generation history entries`);
            }

            alert(mergeSummary.length > 0 ? `Merge complete! Added:\n- ${mergeSummary.join('\n- ')}` : "Merge complete. No new data was found to add.");

        } catch (error) {
             console.error("Merge failed:", error);
            alert(`Merge failed: ${(error as Error).message}`);
        } finally {
            setMergeFileContent(null);
        }
    };
    
  if (isApiKeyNeeded) {
    return <ApiKeyModal onApiKeySubmit={handleApiKeySubmit} errorMessage={apiKeyError} />;
  }
    
  if (!user) {
    return <UserNamePromptModal users={mockData.users} onLogin={handleLogin} />;
  }
  
  if (isReEvaluatingLanguage) {
    return (
        <Modal title="Επανεξέταση Γλώσσας σε Εξέλιξη">
            <p className="text-center text-text-secondary dark:text-[#8B949E] mb-4">
                Εντοπισμός της πρωτότυπης γλώσσας για όλα τα αρχεία. Παρακαλώ περιμένετε...
            </p>
            <div className="w-full bg-primary dark:bg-[#0D1117] rounded-full h-4 border border-border-color dark:border-[#30363D]">
                <div 
                    className="bg-accent h-4 rounded-full transition-all duration-500" 
                    style={{ width: `${(reEvaluateLanguageProgress.current / reEvaluateLanguageProgress.total) * 100}%` }}
                ></div>
            </div>
            <p className="text-center text-sm text-text-secondary dark:text-[#8B949E] mt-2">
                {reEvaluateLanguageProgress.current} / {reEvaluateLanguageProgress.total} αρχεία
            </p>
        </Modal>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'upload':
        return <UploadPage 
                    user={user}
                    allFiles={mockData.files} 
                    metadataTitles={mockData.metadataTitles} 
                    onFileUpload={mockData.addFile} 
                    onFileUpdate={mockData.updateFile} 
                    onDeleteFile={mockData.deleteFile} 
                    onAuthError={handleAuthError}
                />;
      case 'files':
        return <FilesPage 
                    files={mockData.files} 
                    metadataTitles={mockData.metadataTitles} 
                    translatingFileId={translatingFileId}
                    onDelete={mockData.deleteFile} 
                    onEditFile={handleStartEditFile} 
                    onTranslateFile={handleTranslateFile}
                    onBackup={handleBackup}
                    onRestore={() => restoreInputRef.current?.click()}
                    onMerge={() => mergeInputRef.current?.click()}
                    onReEvaluateLanguages={handleReEvaluateLanguages}
                    onUpdateFile={mockData.updateFile}
                />;
      case 'settings':
        return <SettingsPage 
                    metadataTitles={mockData.metadataTitles}
                    metadataRawInputs={mockData.metadataRawInputs}
                    metadataSaveStatus={metadataSaveStatus}
                    onAddMetadataTitle={mockData.addMetadataTitle}
                    onUpdateMetadataTitles={mockData.updateMetadataTitles}
                    onDeleteMetadataTitle={mockData.deleteMetadataTitle}
                    onUpdateMetadataTitleName={mockData.updateMetadataTitleName}
                    onAddMetadataRawInput={mockData.addMetadataRawInput}
                    onAuthError={handleAuthError}
                    users={mockData.users}
                    onAddUser={mockData.addUser}
                    onDeleteUser={mockData.deleteUser}
                />;
      default:
        return <div>Page not found</div>;
    }
  };
  
  const fileToEdit = editingFileId ? mockData.files.find(f => f.id === editingFileId) : null;

  return (
    <div className="flex h-screen bg-primary dark:bg-[#0D1117] font-sans">
      {showInitialLoadPrompt && (
          <InitialLoadModal
              onContinue={() => {
                  setShowInitialLoadPrompt(false);
                  sessionStorage.setItem('initialPromptDismissed', 'true');
              }}
              onLoadBackup={() => {
                  setShowInitialLoadPrompt(false);
                  sessionStorage.setItem('initialPromptDismissed', 'true');
                  restoreInputRef.current?.click();
              }}
          />
      )}
      {showUserGuide && <UserGuide onClose={() => setShowUserGuide(false)} />}
      <Navbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
        onShowGuide={() => setShowUserGuide(true)}
        userName={user.name}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
      <main className="flex-grow overflow-y-auto">
        
        {showBackupOnLogout && (
          <BackupOnLogoutModal
            onCancel={() => setShowBackupOnLogout(false)}
            onLogout={() => {
              setShowBackupOnLogout(false);
              sessionStorage.removeItem('initialPromptDismissed');
              setUser(null);
            }}
            onBackupAndLogout={() => {
              handleBackup();
              setShowBackupOnLogout(false);
              sessionStorage.removeItem('initialPromptDismissed');
              setUser(null);
            }}
          />
        )}

        {/* Restore/Merge confirmation and input */}
        {restoreFileContent && (
            <ConfirmationDialog
                title="Επιβεβαίωση Επαναφοράς"
                message="Είστε βέβαιοι; Αυτή η ενέργεια θα αντικαταστήσει ΟΛΑ τα τρέχοντα δεδομένα (αρχεία, ρυθμίσεις) με τα δεδομένα από το εφεδρικό αντίγραφο. Αυτή η ενέργεια δεν μπορεί να αναιρεθεί."
                onConfirm={handleConfirmRestore}
                onCancel={() => setRestoreFileContent(null)}
                confirmText="Ναι, Επαναφορά"
                cancelText="Ακύρωση"
            />
        )}
         {mergeFileContent && (
            <ConfirmationDialog
                title="Επιβεβαίωση Συγχώνευσης"
                message="Είστε βέβαιοι ότι θέλετε να συγχωνεύσετε τα δεδομένα από το εφεδρικό αντίγραφο; Νέα αρχεία και ρυθμίσεις θα προστεθούν, αλλά τα υπάρχοντα δεδομένα δεν θα αντικατασταθούν."
                onConfirm={handleConfirmMerge}
                onCancel={() => setMergeFileContent(null)}
                confirmText="Ναι, Συγχώνευση"
                cancelText="Ακύρωση"
            />
        )}
        <input type="file" accept=".json" ref={restoreInputRef} onChange={handleRestoreUpload} className="hidden" />
        <input type="file" accept=".json" ref={mergeInputRef} onChange={handleMergeUpload} className="hidden" />

        {fileToEdit ? (
            <EditFilePage 
                file={fileToEdit}
                metadataTitles={mockData.metadataTitles}
                onSave={handleSaveFile}
                onCancel={handleCancelEditFile}
                isTranslatingEn={translatingFileId === fileToEdit.id && translatingLanguage === 'English'}
                isTranslatingGr={translatingFileId === fileToEdit.id && translatingLanguage === 'Greek'}
                onTranslate={(lang) => handleTranslateFile(fileToEdit.id, lang)}
            />
        ) : (
            renderPage()
        )}
      </main>
    </div>
  );
}