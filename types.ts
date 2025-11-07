export type Page = 'upload' | 'files' | 'settings';

export interface User {
  name: string;
}

export interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id:string;
  name: string;
}

export interface MetadataTitle {
  id: string;
  name: string;
}

export interface DigitizedFile {
  id: string;
  originalFilename: string;
  contentHash: string;
  ocrText: string;
  summary: string;
  translationEn?: string;
  translationGr?: string;
  originalLanguage: string;
  categories: { categoryId: string; subcategoryId?: string }[]; // Kept for backup compatibility
  metadata: Record<string, string>;
  classificationGoal: string; // Kept for backup compatibility
  createdAt: string;
  apiCalls: number;
  uploadedBy: string;
  archiveStatus: 'keep' | 'exclude';
}

// Kept for backup compatibility, but will not be used in this app version.
export interface CategoryRawInput {
  id: string;
  pastedText: string;
  createdAt: string;
}

export interface MetadataRawInput {
  id: string;
  pastedText: string;
  createdAt: string;
}

// Kept for backup compatibility, but will not be used in this app version.
export interface CategorySettingsSnapshot {
  savedAt: string;
  categories: Category[];
}

export interface MetadataSettingsSnapshot {
  savedAt: string;
  metadataTitles: MetadataTitle[];
}

// Kept for backup compatibility, but will not be used in this app version.
export interface ClassificationGoalSnapshot {
  id: string;
  goalText: string;
  savedAt: string;
}