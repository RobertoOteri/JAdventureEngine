import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GameSaveDto } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GamePlayService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/game`;

  startNewGame(adventureId: number): Observable<GameSaveDto> {
    return this.http.post<GameSaveDto>(`${this.apiUrl}/adventure/${adventureId}`, {});
  }

  continueGame(adventureId: number): Observable<GameSaveDto> {
    return this.http.get<GameSaveDto>(`${this.apiUrl}/adventure/${adventureId}/continue`);
  }

  loadGame(saveCode: string): Observable<GameSaveDto> {
    return this.http.get<GameSaveDto>(`${this.apiUrl}/load/${saveCode}`, {});
  }

  pauseGame(adventureId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/adventure/${adventureId}/pause`, {});
  }

  resumeGame(adventureId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/adventure/${adventureId}/resume`, {});
  }
}
