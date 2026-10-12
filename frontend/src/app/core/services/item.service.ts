import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/items`;

  createItem(adventureCode: string, sceneCode: string, formData: FormData): Observable<Item> {
    return this.http.post<Item>(`${this.apiUrl}/scene/${adventureCode}/${sceneCode}`, formData);
  }

  updateItem(adventureCode: string, sceneCode: string, itemCode: string, formData: FormData): Observable<Item> {
    return this.http.put<Item>(`${this.apiUrl}/${adventureCode}/${sceneCode}/${itemCode}`, formData);
  }

  deleteItem(adventureCode: string, sceneCode: string, itemCode: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${adventureCode}/${sceneCode}/${itemCode}`);
  }
}
