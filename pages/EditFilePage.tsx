import React, { useState, useEffect } from 'react';
import { DigitizedFile, MetadataTitle } from '../types';
import { CogIcon, TranslateIcon } from '../components/icons';

export const EditFilePage: React.FC<{
    file: DigitizedFile;
    metadataTitles: MetadataTitle[];
    onSave: (fileId: string, updatedData: Partial<Omit<DigitizedFile, 'id'>>) => void;
    onCancel: () => void;
    isTranslatingEn: boolean;
    isTranslatingGr: boolean;
    onTranslate: (language: 'English' | 'Greek') => void;
}> = ({ file, metadataTitles, onSave, onCancel, isTranslatingEn, isTranslatingGr, onTranslate }) => {
    const [summary, setSummary] = useState('');
    const [ocrText, setOcrText] = useState('');
    const [translationEn, setTranslationEn] = useState('');
    const [translationGr, setTranslationGr] = useState('');
    const [metadata, setMetadata] = useState<Record<string, string>>({});

    useEffect(() => {
        if (file) {
            setSummary(file.summary);
            setOcrText(file.ocrText);
            setTranslationEn(file.translationEn || '');
            setTranslationGr(file.translationGr || '');
            setMetadata(file.metadata);
        }
    }, [file]);

    const handleMetadataChange = (title: string, value: string) => {
        setMetadata(prev => ({ ...prev, [title]: value }));
    };
    
    const handleSave = () => {
        onSave(file.id, {
            summary,
            ocrText,
            translationEn,
            translationGr,
            metadata,
        });
    };

    return (
        <div className="p-8 h-full flex flex-col bg-primary dark:bg-[#0D1117]">
            {/* Header */}
            <header className="flex-shrink-0 mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary dark:text-[#C9D1D9]">Επεξεργασία Αρχείου</h1>
                        <p className="text-text-secondary dark:text-[#8B949E]">{file.originalFilename}</p>
                    </div>
                    <div className="flex space-x-4">
                        <button onClick={onCancel} className="bg-secondary dark:bg-[#161B22] text-text-primary dark:text-[#C9D1D9] px-6 py-2 rounded-md border border-border-color dark:border-[#30363D] hover:bg-border-color dark:hover:bg-[#30363D] transition-colors">
                            Ακύρωση
                        </button>
                        <button onClick={handleSave} className="bg-green-600 text-white font-bold px-6 py-2 rounded-md hover:bg-green-500 transition-colors">
                            Αποθήκευση Αλλαγών
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area using Grid */}
            <div className="flex-grow grid grid-cols-2 gap-8 overflow-hidden">
                {/* Left Column (Content) */}
                <div className="col-span-1 flex flex-col gap-8 overflow-y-auto pr-4">
                    {/* OCR Text Panel */}
                    <div className="flex flex-col bg-secondary dark:bg-[#161B22] p-4 rounded-lg border border-border-color dark:border-[#30363D]">
                        <label className="font-semibold text-accent dark:text-[#58A6FF] mb-2 flex-shrink-0">Πρωτότυπο Κείμενο (OCR)</label>
                        <textarea 
                            value={ocrText}
                            onChange={e => setOcrText(e.target.value)}
                            className="w-full h-64 min-h-[10rem] bg-primary dark:bg-[#0D1117] p-3 rounded-md text-sm text-text-secondary dark:text-[#8B949E] border border-border-color dark:border-[#30363D] resize-y focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-[#58A6FF]"
                        />
                    </div>
                    {/* Summary Panel */}
                    <div className="flex flex-col bg-secondary dark:bg-[#161B22] p-4 rounded-lg border border-border-color dark:border-[#30363D]">
                        <label className="font-semibold text-accent dark:text-[#58A6FF] mb-2 flex-shrink-0">Σύνοψη</label>
                        <textarea 
                            value={summary}
                            onChange={e => setSummary(e.target.value)}
                            className="w-full h-48 min-h-[8rem] bg-primary dark:bg-[#0D1117] p-3 rounded-md text-sm text-text-secondary dark:text-[#8B949E] border border-border-color dark:border-[#30363D] resize-y focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-[#58A6FF]"
                        />
                    </div>
                    {/* Translation Panel */}
                    <div className="flex flex-col bg-secondary dark:bg-[#161B22] p-4 rounded-lg border border-border-color dark:border-[#30363D]">
                        <label className="font-semibold text-accent dark:text-[#58A6FF] mb-2 flex-shrink-0">Μετάφραση</label>
                        <div className="w-full flex flex-col gap-4">
                            <div className="flex flex-col">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-sm font-medium text-text-secondary dark:text-[#8B949E]">English</label>
                                    {isTranslatingEn ? (
                                        <CogIcon className="w-5 h-5 text-accent dark:text-[#58A6FF] animate-spin" />
                                    ) : (
                                        <button 
                                            onClick={() => onTranslate('English')}
                                            disabled={!ocrText.trim()}
                                            className="flex items-center gap-1 text-xs text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Translate from OCR text to English"
                                        >
                                            <TranslateIcon className="w-4 h-4" />
                                            <span>Translate</span>
                                        </button>
                                    )}
                                </div>
                                <textarea
                                    value={translationEn}
                                    onChange={e => setTranslationEn(e.target.value)}
                                    placeholder="No English translation available."
                                    className="w-full h-32 min-h-[6rem] bg-primary dark:bg-[#0D1117] p-3 rounded-md text-sm text-text-secondary dark:text-[#8B949E] border border-border-color dark:border-[#30363D] resize-y focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-[#58A6FF]"
                                />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-sm font-medium text-text-secondary dark:text-[#8B949E]">Ελληνικά</label>
                                     {isTranslatingGr ? (
                                        <CogIcon className="w-5 h-5 text-accent dark:text-[#58A6FF] animate-spin" />
                                    ) : (
                                        <button 
                                            onClick={() => onTranslate('Greek')}
                                            disabled={!ocrText.trim()}
                                            className="flex items-center gap-1 text-xs text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Translate from OCR text to Greek"
                                        >
                                            <TranslateIcon className="w-4 h-4" />
                                            <span>Translate</span>
                                        </button>
                                    )}
                                </div>
                                <textarea
                                    value={translationGr}
                                    onChange={e => setTranslationGr(e.target.value)}
                                    placeholder="No Greek translation available."
                                    className="w-full h-32 min-h-[6rem] bg-primary dark:bg-[#0D1117] p-3 rounded-md text-sm text-text-secondary dark:text-[#8B949E] border border-border-color dark:border-[#30363D] resize-y focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-[#58A6FF]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Right Column (Info) */}
                <div className="col-span-1 flex flex-col gap-8 overflow-y-auto pr-2">
                    {/* Metadata Panel */}
                    <div className="flex flex-col bg-secondary dark:bg-[#161B22] p-4 rounded-lg border border-border-color dark:border-[#30363D] flex-1 overflow-hidden">
                        <h3 className="font-semibold text-accent dark:text-[#58A6FF] mb-2 flex-shrink-0">Μεταδεδομένα</h3>
                        <div className="overflow-y-auto pr-2 -mr-2">
                            <div className="grid grid-cols-1 gap-y-3">
                                <div>
                                    <label className="text-sm font-medium text-text-secondary/70 dark:text-[#8B949E]/70 block mb-1">Original Filename</label>
                                    <input type="text" value={file.originalFilename} readOnly className="w-full bg-primary dark:bg-[#0D1117] border-0 rounded-md px-3 py-2 text-text-primary/70 dark:text-[#C9D1D9]/70 cursor-default" />
                                </div>
                                 <div>
                                    <label className="text-sm font-medium text-text-secondary/70 dark:text-[#8B949E]/70 block mb-1">Uploaded by</label>
                                    <input type="text" value={file.uploadedBy} readOnly className="w-full bg-primary dark:bg-[#0D1117] border-0 rounded-md px-3 py-2 text-text-primary/70 dark:text-[#C9D1D9]/70 cursor-default" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-text-secondary/70 dark:text-[#8B949E]/70 block mb-1">Πρωτότυπη γλώσσα κειμένου</label>
                                    <input type="text" value={file.originalLanguage || 'Unknown'} readOnly className="w-full bg-primary dark:bg-[#0D1117] border-0 rounded-md px-3 py-2 text-text-primary/70 dark:text-[#C9D1D9]/70 cursor-default" />
                                </div>
                                {metadataTitles.map(title => (
                                    <div key={title.id}>
                                        <label className="text-sm font-medium text-text-secondary dark:text-[#8B949E] block mb-1 capitalize truncate" title={title.name}>{title.name}</label>
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
                    </div>
                </div>
            </div>
        </div>
    );
};