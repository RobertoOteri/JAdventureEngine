import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GameSaveDto, GameStateDto } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GameSaveService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/saves`;

  getSavesForAdventure(adventureId: number): Observable<GameSaveDto[]> {
    return this.http.get<GameSaveDto[]>(`${this.apiUrl}/saveGame/${adventureId}`);
  }

  createSave(adventureId: number, gameState: GameStateDto | null, saveName?: string): Observable<GameSaveDto> {
    const params = saveName ? new HttpParams().set('saveName', saveName) : undefined;
    return this.http.post<GameSaveDto>(`${this.apiUrl}/${adventureId}`, gameState, { params });
  }

  updateAutoSave(adventureId: number, gameState: GameStateDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${adventureId}/autosave`, gameState);
  }
}
