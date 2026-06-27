export type FoodCategory = 'Plant' | 'Meat' | 'Dairy' | 'Fish' | 'Drink' | 'Meal';
export type AllergenName =
  | 'Gluten' | 'Crustaceans' | 'Eggs' | 'Fish' | 'Peanuts'
  | 'Soy' | 'Milk' | 'Nuts' | 'Celery' | 'Mustard'
  | 'Sesame' | 'Sulfites' | 'Lupin' | 'Molluscs';

export interface AllergenRead {
  id: number;
  name: AllergenName;
}

export interface FoodItemSummary {
  id: number;
  name: string;
  category: FoodCategory;
  sub_category: string | null;
  is_drink: boolean;
}

export interface FoodItemRead extends FoodItemSummary {
  created_at: string;
  allergens: AllergenRead[];
}

export interface FoodItemCreate {
  name: string;
  category: FoodCategory;
  sub_category?: string;
  is_drink?: boolean;
  allergen_ids?: number[];
}
