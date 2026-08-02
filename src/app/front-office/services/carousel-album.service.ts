import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

export interface CarouselAlbum {
  id: number;
  name: string;
  cover: string;
  photosCount: number;
  status: string;
  page?: string;
  section?: string;
  media: {
    id: number;
    title: string;
    type: string;
    url: string;
    alt?: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class CarouselAlbumService {
  constructor(private apiService: ApiService) {}

  getPublishedAlbums(): Observable<any[]> {
    return this.apiService.getPublishedAlbums();
  }

  getPublishedAlbumsByPage(page: string): Observable<any[]> {
    return this.apiService.getPublishedAlbumsByPage(page);
  }

  getPublishedAlbumsByPageAndSection(page: string, section: string): Observable<any[]> {
    return this.apiService.getPublishedAlbumsByPageAndSection(page, section);
  }

  getAlbumMedia(albumId: number): Observable<any> {
    return this.apiService.getMedia();
  }
}
