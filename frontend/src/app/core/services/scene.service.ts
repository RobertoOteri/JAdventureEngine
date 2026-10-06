import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Scene } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SceneService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/adventures`;

  getAllScenes(adventureCode: string): Observable<Scene[]> {
    return this.http.get<Scene[]>(`${this.apiUrl}/${adventureCode}/scenes`);
  }

  getScene(adventureCode: string, sceneCode: string): Observable<Scene> {
    return this.http.get<Scene>(`${this.apiUrl}/${adventureCode}/scenes/${sceneCode}`);
  }

  createScene(adventureCode: string, formData: FormData): Observable<Scene> {
    return this.http.post<Scene>(`${this.apiUrl}/${adventureCode}/scenes`, formData);
  }

  deleteScene(adventureCode: string, sceneCode: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${adventureCode}/scenes/${sceneCode}`);
  }
}
