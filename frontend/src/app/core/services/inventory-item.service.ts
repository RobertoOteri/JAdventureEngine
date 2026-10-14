import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InventoryItem } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InventoryItemService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/inventory-items`;

  getAdventureInventoryItems(adventureCode: string): Observable<InventoryItem[]> {
    const params = new HttpParams().set('adventureCode', adventureCode);
    return this.http.get<InventoryItem[]>(this.apiUrl, { params });
  }

  getInventoryItemById(inventoryItemId: number): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(`${this.apiUrl}/${inventoryItemId}`);
  }

  updateInventoryItem(inventoryItemId: number, formData: FormData): Observable<InventoryItem> {
    return this.http.put<InventoryItem>(`${this.apiUrl}/${inventoryItemId}`, formData);
  }

  deleteInventoryItem(inventoryItemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${inventoryItemId}`);
  }
}
