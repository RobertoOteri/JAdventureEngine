import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Action } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ActionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/adventures`;

  getActions(adventureCode: string, sceneCode: string, itemCode: string): Observable<Action[]> {
    return this.http.get<Action[]>(`${this.apiUrl}/${adventureCode}/scenes/${sceneCode}/items/${itemCode}/actions`);
  }

  getAction(adventureCode: string, sceneCode: string, itemCode: string, actionCode: string): Observable<Action> {
    return this.http.get<Action>(`${this.apiUrl}/${adventureCode}/scenes/${sceneCode}/items/${itemCode}/actions/${actionCode}`);
  }

  addAction(adventureCode: string, sceneCode: string, itemCode: string, action: Action): Observable<Action> {
    return this.http.post<Action>(`${this.apiUrl}/${adventureCode}/scenes/${sceneCode}/items/${itemCode}/actions`, action);
  }

  deleteAction(adventureCode: string, sceneCode: string, itemCode: string, actionCode: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${adventureCode}/scenes/${sceneCode}/items/${itemCode}/actions/${actionCode}`);
  }
}
