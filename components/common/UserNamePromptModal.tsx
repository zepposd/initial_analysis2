import React, { useState, useEffect } from 'react';
import { User } from '../../types';

export const UserNamePromptModal: React.FC<{
    users: User[];
    onLogin: (user: User) => void;
}> = ({ users, onLogin }) => {
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [newUserName, setNewUserName] = useState('');
    const [isNewUserMode, setIsNewUserMode] = useState(users.length === 0);

    useEffect(() => {
        if (users.length > 0 && !isNewUserMode) {
            setSelectedUser(users[0].name);
        }
    }, [users, isNewUserMode]);

    const handleSelectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedUser) {
            onLogin({ name: selectedUser });
        }
    };

    const handleNewUserSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newUserName.trim()) {
            onLogin({ name: newUserName.trim() });
        }
    };

    if (isNewUserMode) {
        return (
            <div className="fixed inset-0 bg-primary dark:bg-dark-primary bg-opacity-95 flex items-center justify-center z-50">
                <div className="bg-secondary dark:bg-[#161B22] p-8 rounded-lg shadow-xl w-full max-w-md border border-border-color dark:border-[#30363D]">
                    <h2 className="text-2xl font-bold text-center text-text-primary dark:text-[#C9D1D9] mb-4">Δημιουργία Νέου Χρήστη</h2>
                    <p className="text-center text-text-secondary dark:text-[#8B949E] mb-6 text-sm">
                        Εισάγετε το όνομά σας για να ξεκινήσετε. Το όνομά σας θα αποθηκευτεί για μελλοντική χρήση.
                    </p>
                    <form onSubmit={handleNewUserSubmit} className="space-y-4">
                        <input
                            type="text"
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            placeholder="Εισάγετε το όνομά σας"
                            className="w-full bg-primary dark:bg-[#0D1117] border border-border-color dark:border-[#30363D] rounded-md px-3 py-2 text-text-primary dark:text-[#C9D1D9] focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-[#58A6FF]"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={!newUserName.trim()}
                            className="w-full bg-accent text-white font-bold py-2 px-4 rounded-md hover:bg-blue-500 dark:hover:bg-blue-400 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Είσοδος
                        </button>
                    </form>
                    {users.length > 0 && (
                        <button onClick={() => setIsNewUserMode(false)} className="w-full text-center text-sm text-accent dark:text-[#58A6FF] hover:underline mt-4">
                            Ή επιλέξτε υπάρχοντα χρήστη
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-primary dark:bg-dark-primary bg-opacity-95 flex items-center justify-center z-50">
            <div className="bg-secondary dark:bg-[#161B22] p-8 rounded-lg shadow-xl w-full max-w-md border border-border-color dark:border-[#30363D]">
                <h2 className="text-2xl font-bold text-center text-text-primary dark:text-[#C9D1D9] mb-4">Επιλογή Χρήστη</h2>
                <p className="text-center text-text-secondary dark:text-[#8B949E] mb-6 text-sm">
                    Επιλέξτε τον χρήστη σας από τη λίστα για να συνεχίσετε.
                </p>
                <form onSubmit={handleSelectSubmit} className="space-y-4">
                    <select
                        value={selectedUser}
                        onChange={e => setSelectedUser(e.target.value)}
                        className="w-full bg-primary dark:bg-[#0D1117] border border-border-color dark:border-[#30363D] rounded-md px-3 py-2 text-text-primary dark:text-[#C9D1D9] focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-[#58A6FF]"
                    >
                        {users.map(user => <option key={user.name} value={user.name}>{user.name}</option>)}
                    </select>
                    <button
                        type="submit"
                        disabled={!selectedUser}
                        className="w-full bg-accent text-white font-bold py-2 px-4 rounded-md hover:bg-blue-500 dark:hover:bg-blue-400 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Συνέχεια
                    </button>
                </form>
                <button onClick={() => setIsNewUserMode(true)} className="w-full text-center text-sm text-accent dark:text-[#58A6FF] hover:underline mt-4">
                    Ή δημιουργήστε νέο χρήστη
                </button>
            </div>
        </div>
    );
};