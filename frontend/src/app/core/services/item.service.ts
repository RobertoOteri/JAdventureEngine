import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Action, Item } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/items`;

  getItemsBySceneId(sceneId: number): Observable<Item[]> {
    const params = new HttpParams().set('sceneId', sceneId.toString());
    return this.http.get<Item[]>(this.apiUrl, { params });
  }

  getItemById(itemId: number): Observable<Item> {
    return this.http.get<Item>(`${this.apiUrl}/${itemId}`);
  }

  updateItem(formData: FormData): Observable<Item> {
    return this.http.put<Item>(this.apiUrl, formData);
  }

  deleteItem(itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${itemId}`);
  }

  addAction(itemId: number, actionDto: Action): Observable<Action> {
    return this.http.post<Action>(`${this.apiUrl}/${itemId}/addAction`, actionDto);
  }
}
