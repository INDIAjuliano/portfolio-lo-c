import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface ContentAlbum {
  id: number;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  isPublished: boolean;
  page?: string | null;
  section?: string | null;
  mediaIds: number[];
  categoryId: number;
  mediaUrls?: string[];
}

export interface ContentMedia {
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

export interface ContentSectionPage {
  id: number;
  page: string;
  section: string;
  title: string;
  description?: string | null;
  content?: string | null;
  imageUrl?: string | null;
  type?: string | null;
  position?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ContentPartner {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
  linkUrl?: string;
  position?: number;
  isPublished: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  constructor(private apiService: ApiService) {}

  getPublishedAlbums(): Observable<ContentAlbum[]> {
    return this.apiService.getPublishedAlbums();
  }

  getPublishedAlbumsByPage(page: string): Observable<ContentAlbum[]> {
    return this.apiService.getPublishedAlbumsByPage(page);
  }

  getPublishedAlbumsByPageAndSection(page: string, section: string): Observable<ContentAlbum[]> {
    return this.apiService.getPublishedAlbumsByPageAndSection(page, section);
  }

  getPublicMedia(): Observable<ContentMedia[]> {
    return this.apiService.getPublicMedia();
  }

  getPublicMediaPage(page: number, limit: number): Observable<ContentMedia[]> {
    return this.apiService.getPublicMediaPage(page, limit);
  }

  getSectionPages(page?: string, section?: string): Observable<ContentSectionPage[]> {
    return this.apiService.getSectionPages(page, section);
  }

  getSectionPage(id: number): Observable<ContentSectionPage> {
    return this.apiService.getSectionPage(id);
  }

  createSectionPage(data: Partial<ContentSectionPage>): Observable<ContentSectionPage> {
    return this.apiService.createSectionPage(data);
  }

  updateSectionPage(id: number, data: Partial<ContentSectionPage>): Observable<ContentSectionPage> {
    return this.apiService.updateSectionPage(id, data);
  }

  deleteSectionPage(id: number): Observable<void> {
    return this.apiService.deleteSectionPage(id);
  }

  getPublishedPartners(): Observable<ContentPartner[]> {
    return this.apiService.getPublishedPartners();
  }

  getSiteLogo(): Observable<ContentPartner | null> {
    return this.apiService.getSiteLogo();
  }

  getUploadPages(): Observable<{name: string; label: string; uploadDir: string; files: string[]}[]> {
    return this.apiService.listPages();
  }

  storeMediaUrl(url: string, page: string, type?: string): Observable<{url: string; type: string; page: string; stored: boolean}> {
    return this.apiService.storeMediaUrl(url, page, type);
  }

  uploadMediaForPage(page: string, file: File): Observable<{url: string; type: string; mimeType: string; size: number; page: string}> {
    return this.apiService.uploadMediaForPage(page, file);
  }
}