import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService, MediaItem, Category } from './api.service';

export interface Album {
  id: number;
  title: string;
  description?: string;
  coverUrl?: string;
  mediaIds: number[];
  categoryId?: number;
  isPublished?: boolean;
  page?: string;
  section?: string;
  mediaUrls?: string[];
  category?: { id: number; name: string };
}

@Injectable({
  providedIn: 'root'
})
export class MediaStateService {
  private mediaSubject = new BehaviorSubject<MediaItem[]>([]);
  public media$ = this.mediaSubject.asObservable();

  private albumsSubject = new BehaviorSubject<Album[]>([]);
  public albums$ = this.albumsSubject.asObservable();

  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  public categories$ = this.categoriesSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private apiService: ApiService) {}

  loadAll(): Observable<void> {
    this.loadingSubject.next(true);
    return forkJoin({
      media: this.apiService.getPublicMedia().pipe(catchError(() => of([]))),
      albums: this.apiService.getPublishedAlbums().pipe(catchError(() => of([]))),
      categories: this.apiService.getCategories().pipe(catchError(() => of([])))
    }).pipe(
      map(({ media, albums, categories }) => {
        this.mediaSubject.next(media);
        this.albumsSubject.next(albums as Album[]);
        this.categoriesSubject.next(categories);
        this.loadingSubject.next(false);
      })
    );
  }

  get currentMedia(): MediaItem[] {
    return this.mediaSubject.value;
  }

  get currentAlbums(): Album[] {
    return this.albumsSubject.value;
  }

  get currentCategories(): Category[] {
    return this.categoriesSubject.value;
  }

  updateMedia(id: number, changes: Partial<MediaItem>): void {
    this.mediaSubject.next(
      this.mediaSubject.value.map(m => m.id === id ? { ...m, ...changes } : m)
    );
  }

  addMedia(media: MediaItem): void {
    this.mediaSubject.next([...this.mediaSubject.value, media]);
  }

  removeMedia(id: number): void {
    this.mediaSubject.next(this.mediaSubject.value.filter(m => m.id !== id));
  }

  updateAlbum(id: number, changes: Partial<Album>): void {
    this.albumsSubject.next(
      this.albumsSubject.value.map(a => a.id === id ? { ...a, ...changes } : a)
    );
  }

  addAlbum(album: Album): void {
    this.albumsSubject.next([...this.albumsSubject.value, album]);
  }

  removeAlbum(id: number): void {
    this.albumsSubject.next(this.albumsSubject.value.filter(a => a.id !== id));
  }

  updateCategory(id: number, changes: Partial<Category>): void {
    this.categoriesSubject.next(
      this.categoriesSubject.value.map(c => c.id === id ? { ...c, ...changes } : c)
    );
  }

  addCategory(category: Category): void {
    this.categoriesSubject.next([...this.categoriesSubject.value, category]);
  }

  removeCategory(id: number): void {
    this.categoriesSubject.next(this.categoriesSubject.value.filter(c => c.id !== id));
  }
}
