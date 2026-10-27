import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GraphicAdventureDto, Item, Scene } from '../models';
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

  getAdventureById(adventureId: number): Observable<GraphicAdventureDto> {
    return this.http.get<GraphicAdventureDto>(`${this.apiUrl}/${adventureId}`);
  }

  createAdventure(formData: FormData): Observable<GraphicAdventureDto> {
    return this.http.post<GraphicAdventureDto>(this.apiUrl, formData);
  }

  updateAdventure(formData: FormData): Observable<GraphicAdventureDto> {
    return this.http.put<GraphicAdventureDto>(this.apiUrl, formData);
  }

  deleteAdventure(adventureId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${adventureId}`);
  }

  addScene(adventureId: number, formData: FormData): Observable<Scene> {
    return this.http.post<Scene>(`${this.apiUrl}/${adventureId}/addScene`, formData);
  }

  addItem(adventureId: number, formData: FormData): Observable<Item> {
    return this.http.post<Item>(`${this.apiUrl}/${adventureId}/addItem`, formData);
  }

}
