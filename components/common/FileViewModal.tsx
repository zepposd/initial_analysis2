
import React from 'react';
import { DigitizedFile } from '../../types';

export const FileViewModal: React.FC<{ 
    file: DigitizedFile | null;
    onClose: () => void;
}> = ({ file, onClose }) => {
    if (!file) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-secondary dark:bg-[#161B22] rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 border border-border-color dark:border-[#30363D]" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">{file.originalFilename}</h2>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-accent dark:text-[#58A6FF]">Summary (Greek)</h3>
                        <p className="mt-1 text-sm bg-primary dark:bg-[#0D1117] p-2 rounded">{file.summary}</p>
                    </div>
                    {file.translationEn && (
                        <div>
                            <h3 className="font-semibold text-accent dark:text-[#58A6FF]">Translation (English)</h3>
                            <p className="mt-1 text-sm bg-primary dark:bg-[#0D1117] p-2 rounded">{file.translationEn}</p>
                        </div>
                    )}
                    {file.translationGr && (
                        <div>
                            <h3 className="font-semibold text-accent dark:text-[#58A6FF]">Translation (Greek)</h3>
                            <p className="mt-1 text-sm bg-primary dark:bg-[#0D1117] p-2 rounded">{file.translationGr}</p>
                        </div>
                    )}
                    <div>
                        <h3 className="font-semibold text-accent dark:text-[#58A6FF]">Full OCR Text</h3>
                        <textarea readOnly value={file.ocrText} className="w-full h-40 mt-1 text-sm bg-primary dark:bg-[#0D1117] p-2 rounded border border-border-color dark:border-[#30363D]"/>
                    </div>
                    <div>
                        <h3 className="font-semibold text-accent dark:text-[#58A6FF]">Metadata</h3>
                        <ul className="list-disc list-inside mt-1 text-sm space-y-1">
                            <li><strong>Original Filename:</strong> {file.originalFilename}</li>
                            <li><strong>Uploaded by:</strong> {file.uploadedBy}</li>
                            <li><strong>Πρωτότυπη γλώσσα κειμένου:</strong> {file.originalLanguage || 'Unknown'}</li>
                            {Object.entries(file.metadata).map(([key, value]) => <li key={key}><strong>{key}:</strong> {value}</li>)}
                        </ul>
                    </div>
                </div>
                <button onClick={onClose} className="mt-6 bg-accent text-white px-4 py-2 rounded-md">Close</button>
            </div>
        </div>
    );
};