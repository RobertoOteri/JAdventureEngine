import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GameSaveDto } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GameSaveService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/saves`;

  getSavesForAdventure(adventureCode: string): Observable<GameSaveDto[]> {
    return this.http.get<GameSaveDto[]>(`${this.apiUrl}/saveGame/${adventureCode}`);
  }

  createSave(activeSaveCode: string, saveName?: string): Observable<GameSaveDto> {
    const params = saveName ? new HttpParams().set('saveName', saveName) : undefined;
    return this.http.post<GameSaveDto>(`${this.apiUrl}/${activeSaveCode}`, null, { params });
  }
}
