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

  deleteAction(actionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${actionId}`);
  }

  getActionById(actionId: number): Observable<Action> {
    return this.http.get<Action>(`${this.apiUrl}/${actionId}`);
  }

  updateAction(actionDto: Action): Observable<Action> {
    return this.http.put<Action>(this.apiUrl, actionDto);
  }

  getActionsByItem(itemId: number): Observable<Action[]> {
    return this.http.get<Action[]>(`${this.apiUrl}/item/${itemId}`);
  }

  getActionsByInventoryItem(inventoryItemId: number): Observable<Action[]> {
    return this.http.get<Action[]>(`${this.apiUrl}/inventory-item/${inventoryItemId}`);
  }

  executeAction(actionDto: GameActionDto): Observable<GameActionResultDto> {
    return this.http.post<GameActionResultDto>(`${this.apiUrl}/execute`, actionDto);
  }
}
