import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  GameActionDto,
  GameActionResultDto,
  GameSaveDto,
  GameStateDto
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GamePlayService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/game`;

  startNewGame(adventureCode: string): Observable<GameStateDto> {
    return this.http.post<GameStateDto>(`${this.apiUrl}/adventure/${adventureCode}`, {});
  }

  continueGame(adventureCode: string): Observable<GameStateDto> {
    return this.http.get<GameStateDto>(`${this.apiUrl}/adventure/${adventureCode}/continue`);
  }

  getSavesForAdventure(adventureCode: string): Observable<GameSaveDto[]> {
    return this.http.get<GameSaveDto[]>(`${this.apiUrl}/adventure/${adventureCode}/saves`);
  }
  loadGame(saveCode: string): Observable<GameStateDto> {
    return this.http.post<GameStateDto>(`${this.apiUrl}/save/${saveCode}/load`, {});
  }

  executeAction(saveCode: string, action: GameActionDto): Observable<GameActionResultDto> {
    return this.http.post<GameActionResultDto>(`${this.apiUrl}/save/${saveCode}/action`, action);
  }

  createSave(activeSaveCode: string, saveName?: string): Observable<GameSaveDto> {
    let params = new HttpParams();
    if (saveName && saveName.trim().length > 0) {
      params = params.set('saveName', saveName.trim());
    }
    return this.http.post<GameSaveDto>(`${this.apiUrl}/save/${activeSaveCode}`, null, { params });
  }
}
