import { FoodItemSummary } from './food.model';

export type Preparation = 'raw' | 'cooked';
export type Quantity = 'small' | 'normal' | 'large';
export type StoolQuality = 'ideal' | 'normal' | 'concerning';

export interface FoodLogRead {
  id: number;
  food_item: FoodItemSummary | null;
  custom_name: string | null;
  entry_type: 'food' | 'drink';
  preparation: Preparation | null;
  quantity: Quantity | null;
  volume_ml: number | null;
  logged_at: string;
  notes: string | null;
}

export interface FoodLogUpdate {
  preparation?: Preparation;
  quantity?: Quantity;
  volume_ml?: number;
  logged_at?: string;
  notes?: string;
}

export interface FoodLogBatchItem {
  food_item_id: number;
  entry_type: 'food' | 'drink';
  preparation?: Preparation;
  quantity?: Quantity;
  volume_ml?: number;
  notes?: string;
}

export interface FoodLogBatchCreate {
  logged_at: string;
  items: FoodLogBatchItem[];
}

export interface StoolLogRead {
  id: number;
  bristol_type: number;
  quality: StoolQuality;
  logged_at: string;
  notes: string | null;
}

export interface StoolLogCreate {
  bristol_type: number;
  quality: StoolQuality;
  logged_at: string;
  notes?: string;
}

export interface StoolLogUpdate {
  bristol_type?: number;
  quality?: StoolQuality;
  logged_at?: string;
  notes?: string;
}

export interface SymptomLogRead {
  id: number;
  name: string;
  intensity: number;
  logged_at: string;
  notes: string | null;
}

export interface SymptomLogCreate {
  name: string;
  intensity: number;
  logged_at: string;
  notes?: string;
}

export interface SymptomLogUpdate {
  name?: string;
  intensity?: number;
  logged_at?: string;
  notes?: string;
}
