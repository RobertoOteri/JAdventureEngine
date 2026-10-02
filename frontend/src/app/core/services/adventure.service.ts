import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GraphicAdventureDto} from '../models/adventure.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdventureService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/adventures`;

  getAllAdventures(): Observable<GraphicAdventureDto[]> {
    return this.http.get<GraphicAdventureDto[]>(this.apiUrl);
  }

  getMyAdventures(): Observable<GraphicAdventureDto[]> {
    return this.http.get<GraphicAdventureDto[]>(`${this.apiUrl}/my`);
  }

  getAdventureByCode(code: string): Observable<GraphicAdventureDto> {
    return this.http.get<GraphicAdventureDto>(`${this.apiUrl}/${code}`);
  }

  createAdventure(formData: FormData): Observable<GraphicAdventureDto> {
    return this.http.post<GraphicAdventureDto>(this.apiUrl, formData);
  }

  deleteAdventure(code: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${code}`);
  }
}
