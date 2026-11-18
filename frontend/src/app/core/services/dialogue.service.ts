import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DialogueNode } from '../models/dialogue-node.model';
import {DialogueChoiceRequestDto, GameActionResultDto} from '../models';

@Injectable({ providedIn: 'root' })
export class DialogueService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/dialogues`;

  findByItem(itemId: number): Observable<DialogueNode[]> {
    return this.http.get<DialogueNode[]>(`${this.baseUrl}/items/${itemId}`);
  }

  saveAll(itemId: number, nodes: DialogueNode[]): Observable<DialogueNode[]> {
    return this.http.put<DialogueNode[]>(`${this.baseUrl}/items/${itemId}`, nodes);
  }

  choose(request: DialogueChoiceRequestDto): Observable<GameActionResultDto> {
    return this.http.post<GameActionResultDto>(`${this.baseUrl}/choose`, request);
  }

  close(adventureId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/close/${adventureId}`, {});
  }

}
