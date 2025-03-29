import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SlikeService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  uploadImage(image: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', image, image.name);
    console.log('FormData kreirana sa:', image.name, image.size, image.type);
    return this.http.post(`${this.baseUrl}/upload`, formData);
  }

  getFolderImages(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/folder-images`);
  }
}
