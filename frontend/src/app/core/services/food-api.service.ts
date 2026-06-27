import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FoodItemRead, FoodItemCreate, FoodItemUpdate, FoodCategory } from '../models/food.model';

@Injectable({ providedIn: 'root' })
export class FoodApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/foods`;

  list(filters: { category?: FoodCategory; is_drink?: boolean; search?: string } = {}): Observable<FoodItemRead[]> {
    let params = new HttpParams();
    if (filters.category != null) params = params.set('category', filters.category);
    if (filters.is_drink != null) params = params.set('is_drink', String(filters.is_drink));
    if (filters.search) params = params.set('search', filters.search);
    return this.http.get<FoodItemRead[]>(this.base, { params });
  }

  create(data: FoodItemCreate): Observable<FoodItemRead> {
    return this.http.post<FoodItemRead>(this.base, data);
  }

  update(id: number, data: FoodItemUpdate): Observable<FoodItemRead> {
    return this.http.patch<FoodItemRead>(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
