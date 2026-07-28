import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface Theme {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price?: string;
  features?: string[];
  previewImage?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserResponse {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  description?: string;
  avatar?: string;
  roles: string[];
  subscriptionType: string;
  isPremium: boolean;
  subscriptionExpiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSubscription {
  subscriptionType: string;
  isPremium: boolean;
  hasActiveSubscription: boolean;
  subscriptionExpiresAt?: string;
  canInstallThemes: boolean;
}

export interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
}

export interface MediaItem {
  id: number;
  title: string;
  slug: string;
  description?: string;
  type: string;
  imageUrl?: string;
  videoUrl?: string;
  embedUrl?: string;
  platform?: string;
  videoId?: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  orientation?: string;
  mimeType?: string;
  fileSize?: number;
  altText?: string;
  duration?: number;
  durationFormatted?: string;
  gallery?: any;
  tags?: string[];
  isPublished: boolean;
  isFeatured: boolean;
  views: number;
  likes: number;
  albumId?: number;
  albumName?: string;
  albums?: { id: number; name: string }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AlbumCreateRequest {
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  mediaIds: number[];
  categoryId: number;
}

export interface AlbumUpdateRequest {
  title?: string;
  description?: string | null;
  coverUrl?: string | null;
  mediaIds?: number[];
  categoryId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // ==================== THEMES ====================

  getThemes(): Observable<Theme[]> {
    return this.http.get<Theme[]>(`${this.apiUrl}/themes`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getTheme(id: number): Observable<Theme> {
    return this.http.get<Theme>(`${this.apiUrl}/themes/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  createTheme(theme: Partial<Theme>): Observable<Theme> {
    return this.http.post<Theme>(`${this.apiUrl}/themes`, theme, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  updateTheme(id: number, theme: Partial<Theme>): Observable<Theme> {
    return this.http.put<Theme>(`${this.apiUrl}/themes/${id}`, theme, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  deleteTheme(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/themes/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  applyTheme(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/themes/${id}/apply`, {}, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // ==================== SUBSCRIPTION ====================

  getSubscriptionStatus(): Observable<UserSubscription> {
    return this.http.get<UserSubscription>(`${this.apiUrl}/subscription/status`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  requestPremium(message?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/subscription/request-premium`, { message }, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // ==================== USERS ====================

  getUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiUrl}/users`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getUser(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/users/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  upgradeUserToPremium(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}/upgrade-premium`, {}, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  downgradeUserToFree(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}/downgrade-free`, {}, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // ==================== MEDIA ====================

  getMedia(type?: string): Observable<any[]> {
    const url = type ? `${this.apiUrl}/media?type=${type}` : `${this.apiUrl}/media`;
    return this.http.get<any[]>(url, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getPublicMedia(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/public/media`).pipe(
      catchError(this.handleError)
    );
  }

  createMedia(media: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/media`, media, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  updateMedia(id: number, media: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/media/${id}`, media, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  deleteMedia(id: number): Observable<void> {
    return this.http.delete(`${this.apiUrl}/media/${id}`, { headers: this.getAuthHeaders() }).pipe(
      map(() => {}),
      catchError(this.handleError)
    );
  }

  uploadMedia(file: File): Observable<{url: string; type: string; mimeType: string; size: number}> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
    return this.http.post<{url: string; type: string; mimeType: string; size: number}>(`${this.apiUrl}/upload/media`, formData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // ==================== CATEGORIES ====================

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/categories/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  createCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, category, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  updateCategory(id: number, category: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/categories/${id}`, category, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete(`${this.apiUrl}/categories/${id}`, { headers: this.getAuthHeaders() }).pipe(
      map(() => {}),
      catchError(this.handleError)
    );
  }

  // ==================== ALBUMS ====================

  getAlbums(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/albums`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  createAlbum(album: AlbumCreateRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/albums`, album, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  updateAlbum(id: number, album: AlbumUpdateRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/albums/${id}`, album, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  deleteAlbum(id: number): Observable<void> {
    return this.http.delete(`${this.apiUrl}/albums/${id}`, { headers: this.getAuthHeaders() }).pipe(
      map(() => {}),
      catchError(this.handleError)
    );
  }

  addMediaToAlbum(albumId: number, mediaId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/albums/${albumId}/media`, { mediaId }, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  removeMediaFromAlbum(albumId: number, mediaId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/albums/${albumId}/media/${mediaId}`, { headers: this.getAuthHeaders() }).pipe(
      map(() => {}),
      catchError(this.handleError)
    );
  }

  uploadAlbumCover(file: File): Observable<{url: string}> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
    return this.http.post<{url: string}>(`${this.apiUrl}/upload/album-cover`, formData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // ==================== CONTACTS ====================

  getContacts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/contacts`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  createContact(contact: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/contacts`, contact, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // ==================== AUTH ====================

  getMe(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/auth/me`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // ==================== ERROR HANDLING ====================

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => error);
  }
}
