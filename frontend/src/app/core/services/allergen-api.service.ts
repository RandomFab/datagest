import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AllergenRead } from '../models/food.model';

@Injectable({ providedIn: 'root' })
export class AllergenApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/allergens`;

  list(): Observable<AllergenRead[]> {
    return this.http.get<AllergenRead[]>(this.base);
  }
}
