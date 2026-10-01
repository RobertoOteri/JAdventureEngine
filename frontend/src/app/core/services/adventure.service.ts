import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GraphicAdventureResponse } from '../models/adventure.model';

@Injectable({
  providedIn: 'root'
})
export class AdventureService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/adventures';

  getAllAdventures(): Observable<GraphicAdventureResponse[]> {
    return this.http.get<GraphicAdventureResponse[]>(this.baseUrl);
  }

  getMyAdventures(): Observable<GraphicAdventureResponse[]> {
    return this.http.get<GraphicAdventureResponse[]>(`${this.baseUrl}/my`);
  }

  getAdventureByCode(code: string): Observable<GraphicAdventureResponse> {
    return this.http.get<GraphicAdventureResponse>(`${this.baseUrl}/${code}`);
  }

  createAdventure(formData: FormData): Observable<GraphicAdventureResponse> {
    return this.http.post<GraphicAdventureResponse>(this.baseUrl, formData);
  }

  deleteAdventure(code: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${code}`);
  }
}
