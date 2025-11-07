

import React, { useState, useMemo } from 'react';
import { MetadataTitle, MetadataRawInput, User } from '../types';
import { generateMetadataTitlesAI } from '../services/geminiService';
import { HistoryIcon, PlusIcon, SparklesIcon, TrashIcon } from '../components/icons';
import { AutoSaveIndicator } from '../components/common/AutoSaveIndicator';


export const SettingsPage: React.FC<{
    metadataTitles: MetadataTitle[];
    metadataRawInputs: MetadataRawInput[];
    metadataSaveStatus: 'idle' | 'pending' | 'saving' | 'saved';
    users: User[];
    onAddMetadataTitle: (name: string) => void;
    onUpdateMetadataTitles: (titles: MetadataTitle[]) => void;
    onDeleteMetadataTitle: (id: string) => void;
    onUpdateMetadataTitleName: (titleId: string, newName: string) => void;
    onAddMetadataRawInput: (pastedText: string) => void;
    onAddUser: (name: string) => void;
    onDeleteUser: (name: string) => void;
    onAuthError: () => void;
}> = (props) => {
    const [newMetaTitle, setNewMetaTitle] = useState('');
    const [pastedMetadata, setPastedMetadata] = useState('');
    const [isGeneratingMeta, setIsGeneratingMeta] = useState(false);
    const [showMetadataHistory, setShowMetadataHistory] = useState(false);
    const [newUserName, setNewUserName] = useState('');

    const handleGenAIMetadata = async (text: string) => {
        if (!text) return;
        if (text === pastedMetadata) {
            props.onAddMetadataRawInput(text);
        }
        setIsGeneratingMeta(true);
        try {
            const newTitles = await generateMetadataTitlesAI(text);
            const newMetadataTitles: MetadataTitle[] = newTitles.map(name => ({
                id: `meta-${Date.now()}-${Math.random()}`,
                name: name
            }));
            
            const existingNames = new Set(props.metadataTitles.map(t => t.name.toLowerCase()));
            const uniqueNewTitles = newMetadataTitles.filter(t => !existingNames.has(t.name.toLowerCase()));
            
            const combinedTitles = [...props.metadataTitles, ...uniqueNewTitles];
            props.onUpdateMetadataTitles(combinedTitles);
            
            if (text === pastedMetadata) {
                setPastedMetadata('');
            }
        } catch (e) {
            if ((e as Error).message.includes("Invalid Gemini API Key")) {
                props.onAuthError();
            } else {
                alert((e as Error).message);
            }
        } finally {
            setIsGeneratingMeta(false);
            setShowMetadataHistory(false);
        }
    }

    const sortedMetadataHistory = useMemo(() => [...props.metadataRawInputs].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [props.metadataRawInputs]);


    return (
        <div className="p-8 space-y-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold">Ρυθμίσεις</h1>
            <div className="bg-secondary dark:bg-[#161B22] p-6 rounded-lg border border-border-color dark:border-[#30363D] space-y-4 flex flex-col">
                <div className="flex-grow space-y-4">
                    <h2 className="text-lg font-semibold">Διαχείριση Τίτλων Μεταδεδομένων</h2>
                     <div className="bg-primary dark:bg-[#0D1117] p-4 rounded-lg border border-border-color dark:border-[#30363D] space-y-2 relative">
                        <div className="flex justify-between items-center">
                            <h3 className="font-medium flex items-center"><SparklesIcon className="w-5 h-5 mr-2 text-yellow-400" /> Generate Metadata Titles with AI</h3>
                            <button onClick={() => setShowMetadataHistory(prev => !prev)} title="Restore from history" className="p-1 hover:bg-secondary dark:hover:bg-[#161B22] rounded-full">
                                <HistoryIcon className="w-5 h-5 text-text-secondary dark:text-[#8B949E]"/>
                            </button>
                        </div>
                        {showMetadataHistory && (
                             <div className="absolute top-full right-0 mt-2 w-full max-w-sm bg-secondary dark:bg-[#161B22] border border-border-color dark:border-[#30363D] rounded-lg shadow-lg z-10 p-2 space-y-2 max-h-60 overflow-y-auto">
                                <h4 className="text-sm font-bold px-2">Restore Previous Input</h4>
                                {sortedMetadataHistory.length > 0 ? sortedMetadataHistory.map(item => (
                                    <div key={item.id} className="bg-primary dark:bg-[#0D1117] p-2 rounded-md">
                                        <p className="text-xs text-text-secondary dark:text-[#8B949E] mb-1">{new Date(item.createdAt).toLocaleString()}</p>
                                        <p className="text-sm truncate mb-2">{item.pastedText}</p>
                                        <button 
                                            onClick={() => handleGenAIMetadata(item.pastedText)}
                                            className="w-full text-xs bg-accent text-white py-1 rounded hover:bg-blue-500 dark:hover:bg-blue-400"
                                            disabled={isGeneratingMeta}
                                        >
                                            Restore
                                        </button>
                                    </div>
                                )) : <p className="text-xs text-center text-text-secondary dark:text-[#8B949E] p-2">No history found.</p>}
                            </div>
                        )}
                        <textarea
                            placeholder="Επικολλήστε δείγμα κειμένου εδώ για να προτείνει τίτλους το AI..."
                            value={pastedMetadata}
                            onChange={e => setPastedMetadata(e.target.value)}
                            className="w-full h-24 bg-secondary dark:bg-[#161B22] p-2 rounded-md border border-border-color dark:border-[#30363D]"
                        />
                        <button onClick={() => handleGenAIMetadata(pastedMetadata)} disabled={isGeneratingMeta || !pastedMetadata} className="w-full bg-accent text-white font-bold py-2 px-4 rounded-md hover:bg-blue-500 dark:hover:bg-blue-400 transition duration-300 disabled:bg-gray-400 dark:disabled:bg-gray-600">
                           {isGeneratingMeta ? "Παραγωγή..." : "Δημιουργία από AI"}
                        </button>
                    </div>
                    <div className="space-y-2">
                        {props.metadataTitles.map(title => (
                            <div key={title.id} className="flex justify-between items-center bg-primary dark:bg-[#0D1117] p-3 rounded-md group">
                                 <input
                                    type="text"
                                    value={title.name}
                                    onChange={(e) => props.onUpdateMetadataTitleName(title.id, e.target.value)}
                                    className="bg-transparent focus:bg-secondary dark:focus:bg-[#161B22] focus:outline-none focus:ring-1 focus:ring-accent dark:focus:ring-[#58A6FF] rounded px-1 w-full capitalize"
                                />
                                <button onClick={() => props.onDeleteMetadataTitle(title.id)} className="opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon className="w-5 h-5 text-red-500 hover:text-red-400" /></button>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center space-x-2">
                        <input type="text" placeholder="New metadata title" value={newMetaTitle} onChange={e => setNewMetaTitle(e.target.value)} className="flex-grow bg-primary dark:bg-[#0D1117] border border-border-color dark:border-[#30363D] rounded px-3 py-2" />
                        <button onClick={() => {props.onAddMetadataTitle(newMetaTitle); setNewMetaTitle('');}} className="bg-green-600 p-2 rounded hover:bg-green-500"><PlusIcon /></button>
                    </div>
                </div>
                 <div className="mt-auto pt-4 border-t border-border-color dark:border-[#30363D]">
                    <AutoSaveIndicator status={props.metadataSaveStatus} />
                </div>
            </div>

            <div className="bg-secondary dark:bg-[#161B22] p-6 rounded-lg border border-border-color dark:border-[#30363D] space-y-4">
                <h2 className="text-lg font-semibold">Διαχείριση Χρηστών</h2>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {props.users.map(user => (
                        <div key={user.name} className="flex justify-between items-center bg-primary dark:bg-[#0D1117] p-3 rounded-md group">
                            <span>{user.name}</span>
                            <button onClick={() => props.onDeleteUser(user.name)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <TrashIcon className="w-5 h-5 text-red-500 hover:text-red-400" />
                            </button>
                        </div>
                    ))}
                    {props.users.length === 0 && <p className="text-sm text-text-secondary dark:text-[#8B949E] italic">Δεν υπάρχουν αποθηκευμένοι χρήστες.</p>}
                </div>
                <div className="flex items-center space-x-2 pt-2 border-t border-border-color dark:border-[#30363D]">
                    <input 
                        type="text" 
                        placeholder="Όνομα νέου χρήστη" 
                        value={newUserName} 
                        onChange={e => setNewUserName(e.target.value)} 
                        className="flex-grow bg-primary dark:bg-[#0D1117] border border-border-color dark:border-[#30363D] rounded px-3 py-2" 
                    />
                    <button 
                        onClick={() => { props.onAddUser(newUserName); setNewUserName(''); }} 
                        className="bg-green-600 p-2 rounded hover:bg-green-500 disabled:opacity-50"
                        disabled={!newUserName.trim()}
                    >
                        <PlusIcon />
                    </button>
                </div>
            </div>

        </div>
    );
};