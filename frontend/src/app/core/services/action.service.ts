import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Action, GameActionDto, GameActionResultDto } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ActionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/actions`;

  addAction(adventureCode: string, sceneCode: string, itemCode: string, action: Action): Observable<Action> {
    return this.http.post<Action>(`${this.apiUrl}/${adventureCode}/${sceneCode}/${itemCode}`, action);
  }

  deleteAction(actionCode: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${actionCode}`);
  }

  executeAction(actionDto: GameActionDto): Observable<GameActionResultDto> {
    return this.http.post<GameActionResultDto>(`${this.apiUrl}/execute`, actionDto);
  }

  getActionsByItem(itemCode: string): Observable<Action[]> {
    return this.http.get<Action[]>(`${this.apiUrl}/item/${itemCode}`);
  }
}
