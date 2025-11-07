
import React, { useState } from 'react';

export const ApiKeyModal: React.FC<{
    onApiKeySubmit: (apiKey: string) => void;
    errorMessage?: string;
}> = ({ onApiKeySubmit, errorMessage }) => {
    const [apiKey, setApiKey] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (apiKey.trim()) {
            onApiKeySubmit(apiKey.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-primary dark:bg-dark-primary bg-opacity-95 flex items-center justify-center z-50">
            <div className="bg-secondary dark:bg-[#161B22] p-8 rounded-lg shadow-xl w-full max-w-md border border-border-color dark:border-[#30363D]">
                <h2 className="text-2xl font-bold text-center text-text-primary dark:text-[#C9D1D9] mb-4">Enter Gemini API Key</h2>
                <p className="text-center text-text-secondary dark:text-[#8B949E] mb-6 text-sm">
                    To use this application, you need to provide your own Google Gemini API key. Your key will be stored temporarily in your browser session and will not be saved on any server.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your API key here"
                        className="w-full bg-primary dark:bg-[#0D1117] border border-border-color dark:border-[#30363D] rounded-md px-3 py-2 text-text-primary dark:text-[#C9D1D9] focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-[#58A6FF]"
                    />
                    {errorMessage && <p className="text-red-500 text-xs text-center">{errorMessage}</p>}
                    <button 
                        type="submit" 
                        disabled={!apiKey.trim()}
                        className="w-full bg-accent text-white font-bold py-2 px-4 rounded-md hover:bg-blue-500 dark:hover:bg-blue-400 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save and Continue
                    </button>
                </form>
                 <div className="mt-6 pt-4 border-t border-border-color dark:border-[#30363D]">
                    <p className="text-xs text-center text-text-secondary dark:text-[#8B949E]">
                        You can get a Gemini API key from {' '}
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-accent dark:text-[#58A6FF] hover:underline">
                            Google AI Studio
                        </a>.
                    </p>
                </div>
            </div>
        </div>
    );
};
