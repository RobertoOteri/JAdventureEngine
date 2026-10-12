import { inject, Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import {
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

  loadGame(saveCode: string): Observable<GameStateDto> {
    return this.http.post<GameStateDto>(`${this.apiUrl}/load/${saveCode}`, {});
  }

}
