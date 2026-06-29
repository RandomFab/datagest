import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  FoodLogCreate, FoodLogRead, FoodLogUpdate,
  StoolLogCreate, StoolLogRead, StoolLogUpdate,
  SymptomLogCreate, SymptomLogRead, SymptomLogUpdate,
} from '../models/log.model';

@Injectable({ providedIn: 'root' })
export class LogApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  // --- Food logs ---
  listFoodLogs(date: string): Observable<FoodLogRead[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<FoodLogRead[]>(`${this.base}/logs/food`, { params });
  }

  createFoodLog(data: FoodLogCreate): Observable<FoodLogRead> {
    return this.http.post<FoodLogRead>(`${this.base}/logs/food`, data);
  }

  updateFoodLog(id: number, data: FoodLogUpdate): Observable<FoodLogRead> {
    return this.http.patch<FoodLogRead>(`${this.base}/logs/food/${id}`, data);
  }

  deleteFoodLog(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/logs/food/${id}`);
  }

  // --- Stool logs ---
  listStoolLogs(date: string): Observable<StoolLogRead[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<StoolLogRead[]>(`${this.base}/logs/stools`, { params });
  }

  createStoolLog(data: StoolLogCreate): Observable<StoolLogRead> {
    return this.http.post<StoolLogRead>(`${this.base}/logs/stools`, data);
  }

  updateStoolLog(id: number, data: StoolLogUpdate): Observable<StoolLogRead> {
    return this.http.patch<StoolLogRead>(`${this.base}/logs/stools/${id}`, data);
  }

  deleteStoolLog(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/logs/stools/${id}`);
  }

  // --- Symptom logs ---
  listSymptomLogs(date: string): Observable<SymptomLogRead[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<SymptomLogRead[]>(`${this.base}/logs/symptoms`, { params });
  }

  createSymptomLog(data: SymptomLogCreate): Observable<SymptomLogRead> {
    return this.http.post<SymptomLogRead>(`${this.base}/logs/symptoms`, data);
  }

  updateSymptomLog(id: number, data: SymptomLogUpdate): Observable<SymptomLogRead> {
    return this.http.patch<SymptomLogRead>(`${this.base}/logs/symptoms/${id}`, data);
  }

  deleteSymptomLog(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/logs/symptoms/${id}`);
  }
}
