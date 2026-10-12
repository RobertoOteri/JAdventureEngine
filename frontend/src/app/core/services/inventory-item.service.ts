import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InventoryItem } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InventoryItemService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/inventory-items`;

  getInventoryItem(adventureCode: string, itemCode: string): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(`${this.apiUrl}/${adventureCode}/${itemCode}`);
  }

  updateInventoryItem(adventureCode: string, itemCode: string, formData: FormData): Observable<InventoryItem> {
    return this.http.put<InventoryItem>(`${this.apiUrl}/${adventureCode}/${itemCode}`, formData);
  }

  deleteInventoryItem(adventureCode: string, itemCode: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${adventureCode}/${itemCode}`);
  }
}
