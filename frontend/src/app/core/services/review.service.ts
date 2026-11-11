import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { RatingSummaryDto, ReviewDto } from '../models/review.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getReviews(adventureId: number, page = 0, size = 10): Observable<ReviewDto[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ReviewDto[]>(`${this.apiUrl}/adventures/${adventureId}/reviews`, { params });
  }

  getSummary(adventureId: number): Observable<RatingSummaryDto> {
    return this.http.get<RatingSummaryDto>(`${this.apiUrl}/adventures/${adventureId}/reviews/summary`);
  }

  getSummaries(codes: string[]): Observable<RatingSummaryDto[]> {
    const params = new HttpParams().set('codes', codes.join(','));
    return this.http.get<RatingSummaryDto[]>(`${this.apiUrl}/reviews/summaries`, { params });
  }

  getMyReview(adventureId: number): Observable<ReviewDto | null> {
    return this.http
      .get<ReviewDto>(`${this.apiUrl}/adventures/${adventureId}/reviews/me`, { observe: 'response' })
      .pipe(map((response) => response.body ?? null));
  }

  canReview(adventureId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/adventures/${adventureId}/reviews/me/allowed`);
  }

  saveMyReview(adventureId: number, review: Pick<ReviewDto, 'rating' | 'comment'>): Observable<ReviewDto> {
    return this.http.put<ReviewDto>(`${this.apiUrl}/adventures/${adventureId}/reviews/me`, review);
  }

  deleteMyReview(adventureId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/adventures/${adventureId}/reviews/me`);
  }
}
