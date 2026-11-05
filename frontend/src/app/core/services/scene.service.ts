import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item, Scene } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SceneService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/scenes`;

  getScenes(adventureId: number): Observable<Scene[]> {
    const params = new HttpParams().set('adventureId', adventureId);
    return this.http.get<Scene[]>(this.apiUrl, { params });
  }

  getAllScenes(adventureId: number): Observable<Scene[]> {
    return this.getScenes(adventureId);
  }

  getSceneById(sceneId: number): Observable<Scene> {
    return this.http.get<Scene>(`${this.apiUrl}/${sceneId}`);
  }

  deleteScene(sceneId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${sceneId}`);
  }

  addItemToScene(sceneId: number, formData: FormData): Observable<Item> {
    return this.http.post<Item>(`${this.apiUrl}/${sceneId}/addItem`, formData);
  }
}
