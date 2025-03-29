import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FilmoviService {
  private apiUrl = `${environment.apiUrl}/servis/filmovi`;

  constructor(private http: HttpClient) {}

  getFilmovi(
    datumOd?: string,
    datumDo?: string,
    page: number = 1
  ): Observable<{ ukupno: number; filmovi: any[] }> {
    let params = new HttpParams().set('page', page);

    if (datumOd) {
      params = params.set('datumOd', datumOd);
    }
    if (datumDo) {
      params = params.set('datumDo', datumDo);
    }

    return this.http.get<{ ukupno: number; filmovi: any[] }>(this.apiUrl, {
      params,
    });
  }
}
