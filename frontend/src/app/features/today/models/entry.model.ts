export type EntryType = 'food' | 'drink' | 'stool' | 'symptom';

export interface Entry {
  id: string;
  type: EntryType;
  name: string;
  detail: string;
  time: string;   // "HH:mm"
  date: string;   // "YYYY-MM-DD"
  quality?: 'ideal' | 'normal' | 'concerning';
  intensity?: number;  // 1-10, for symptoms
  bristolType?: number; // 1-7, for stool
}

export interface Food {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  allergens: string[];
}

export const BRISTOL_TYPES = [
  { type: 1, label: 'Type 1 · Separate hard lumps', desc: 'Like nuts, hard to pass', quality: 'concerning' as const },
  { type: 2, label: 'Type 2 · Lumpy sausage', desc: 'Sausage-shaped but lumpy', quality: 'concerning' as const },
  { type: 3, label: 'Type 3 · Sausage with cracks', desc: 'Surface with cracks', quality: 'normal' as const },
  { type: 4, label: 'Type 4 · Smooth soft sausage', desc: 'Like a sausage or snake', quality: 'ideal' as const },
  { type: 5, label: 'Type 5 · Soft blobs', desc: 'Clear-cut edges, passed easily', quality: 'normal' as const },
  { type: 6, label: 'Type 6 · Fluffy mushy', desc: 'Fluffy pieces with ragged edges', quality: 'concerning' as const },
  { type: 7, label: 'Type 7 · Watery', desc: 'No solid pieces, entirely liquid', quality: 'concerning' as const },
];

export const SYMPTOM_PRESETS = [
  'Bloating', 'Nausea', 'Abdominal pain', 'Cramping',
  'Heartburn', 'Gas', 'Fatigue', 'Headache',
];
