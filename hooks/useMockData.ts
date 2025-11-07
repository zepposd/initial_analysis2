
import { useState, useEffect } from 'react';
import { DigitizedFile, Category, MetadataTitle, CategoryRawInput, MetadataRawInput, CategorySettingsSnapshot, MetadataSettingsSnapshot, ClassificationGoalSnapshot, User } from '../types';

const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue] as const;
};

const initialFiles: DigitizedFile[] = [];
const initialMetadataTitles: MetadataTitle[] = [
    { id: 'meta-1', name: 'Χρονολογία' },
    { id: 'meta-2', name: 'Αριθμός πρωτοκόλλου' },
    { id: 'meta-3', name: 'Ποιος συντάσσει έγγραφο' },
    { id: 'meta-4', name: 'Πού/τόπος' },
    { id: 'meta-5', name: 'Σε ποιον το απευθύνει' },
    { id: 'meta-6', name: 'Φάκελος εγγράφου/αρχείο/αρ φωτογρ' },
];
const initialMetadataRawInputs: MetadataRawInput[] = [];
const initialMetadataSettingsHistory: MetadataSettingsSnapshot[] = [];
const initialUsers: User[] = [];

// Kept for backup compatibility
const initialCategories: Category[] = [];
const initialCategoryRawInputs: CategoryRawInput[] = [];
const initialCategorySettingsHistory: CategorySettingsSnapshot[] = [];
const initialClassificationGoalHistory: ClassificationGoalSnapshot[] = [];

export const useMockData = () => {
  const [files, setFiles] = useLocalStorage<DigitizedFile[]>('digitizedFiles', initialFiles);
  const [metadataTitles, setMetadataTitles] = useLocalStorage<MetadataTitle[]>('metadataTitles', initialMetadataTitles);
  const [metadataRawInputs, setMetadataRawInputs] = useLocalStorage<MetadataRawInput[]>('metadataRawInputs', initialMetadataRawInputs);
  const [metadataSettingsHistory, setMetadataSettingsHistory] = useLocalStorage<MetadataSettingsSnapshot[]>('metadataSettingsHistory', initialMetadataSettingsHistory);
  const [users, setUsers] = useLocalStorage<User[]>('savedUsers', initialUsers);

  // Stored for backup file compatibility but not used in the UI.
  const [categories, setCategories] = useLocalStorage<Category[]>('categories', initialCategories);
  const [categoryRawInputs, setCategoryRawInputs] = useLocalStorage<CategoryRawInput[]>('categoryRawInputs', initialCategoryRawInputs);
  const [categorySettingsHistory, setCategorySettingsHistory] = useLocalStorage<CategorySettingsSnapshot[]>('categorySettingsHistory', initialCategorySettingsHistory);
  const [classificationGoal, setClassificationGoal] = useLocalStorage<string>('classificationGoal', '');
  const [classificationGoalHistory, setClassificationGoalHistory] = useLocalStorage<ClassificationGoalSnapshot[]>('classificationGoalHistory', initialClassificationGoalHistory);


  const addFile = (fileData: Omit<DigitizedFile, 'id'>) => {
    const newFile: DigitizedFile = { ...fileData, id: crypto.randomUUID() };
    setFiles(prevFiles => [...prevFiles, newFile]);
  };

  const updateFile = (fileId: string, updatedData: Partial<Omit<DigitizedFile, 'id'>>) => {
    setFiles(prevFiles =>
      prevFiles.map(file =>
        file.id === fileId ? { ...file, ...updatedData } : file
      )
    );
  };

  const deleteFile = (fileId: string) => {
    setFiles(prevFiles => prevFiles.filter(f => f.id !== fileId));
  };

  // Metadata Title Management
  const addMetadataTitle = (name: string) => {
    setMetadataTitles(prev => [...prev, { id: crypto.randomUUID(), name }]);
  };
  
  const updateMetadataTitles = (newTitles: MetadataTitle[]) => {
    setMetadataTitles(newTitles);
  };

  const deleteMetadataTitle = (titleId: string) => {
    setMetadataTitles(prev => prev.filter(t => t.id !== titleId));
  };
  
  const updateMetadataTitleName = (titleId: string, newName: string) => {
    setMetadataTitles(prev => prev.map(t => t.id === titleId ? { ...t, name: newName } : t));
  };

  const saveMetadataTitlesSnapshot = () => {
    const newSnapshot: MetadataSettingsSnapshot = {
      savedAt: new Date().toISOString(),
      metadataTitles: metadataTitles
    };
    setMetadataSettingsHistory(prev => [...prev, newSnapshot]);
    return newSnapshot.savedAt;
  };
  
  const addMetadataRawInput = (pastedText: string) => {
    const newInput: MetadataRawInput = {
      id: crypto.randomUUID(),
      pastedText,
      createdAt: new Date().toISOString(),
    };
    setMetadataRawInputs(prev => [...prev, newInput]);
  };
  
  const addUser = (name: string) => {
    const nameExists = users.some(u => u.name.toLowerCase() === name.trim().toLowerCase());
    if (!nameExists && name.trim()) {
      setUsers(prev => [...prev, { name: name.trim() }]);
    }
  };

  const deleteUser = (name: string) => {
    setUsers(prev => prev.filter(u => u.name !== name));
  };


  return {
    files,
    setFiles,
    addFile,
    updateFile,
    deleteFile,
    metadataTitles,
    setMetadataTitles,
    addMetadataTitle,
    updateMetadataTitles,
    deleteMetadataTitle,
    updateMetadataTitleName,
    saveMetadataTitlesSnapshot,
    metadataRawInputs,
    setMetadataRawInputs,
    addMetadataRawInput,
    metadataSettingsHistory,
    setMetadataSettingsHistory,
    users,
    addUser,
    deleteUser,
    // Compatibility fields
    categories,
    setCategories,
    categoryRawInputs,
    setCategoryRawInputs,
    categorySettingsHistory,
    setCategorySettingsHistory,
    classificationGoal,
    setClassificationGoal,
    classificationGoalHistory,
    setClassificationGoalHistory,
  };
};
