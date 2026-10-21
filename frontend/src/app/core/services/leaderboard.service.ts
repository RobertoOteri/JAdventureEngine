import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LeaderboardEntryDto } from '../models/leaderboard-entry.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl + '/leaderboard';

  getLeaderboard(adventureCode: string): Observable<LeaderboardEntryDto[]> {
    return this.http.get<LeaderboardEntryDto[]>(this.apiUrl + '/' + adventureCode);
  }
}
