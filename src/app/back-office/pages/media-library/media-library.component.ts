import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../front-office/components/icon/icon.component';

interface MediaItem {
  id: number;
  title: string;
  category: string;
  type: string;
  url: string;
  date: string;
  alt: string;
  description: string;
  keywords: string[];
  status: string;
  albumId: number;
  albumName: string;
}

interface Album {
  id: number;
  name: string;
  cover: string;
  category: string;
  photosCount: number;
  status: 'published' | 'draft';
}

@Component({
  selector: 'app-media-library',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './media-library.component.html',
  styleUrl: './media-library.component.css'
})
export class MediaLibraryComponent implements OnInit, OnDestroy {
  images: MediaItem[] = [
    {
      id: 1,
      title: 'Chevrolet Corvette C8',
      category: 'Cars',
      type: 'Photo',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtwh-yTiMGrGHQFWwYI9yXYGIXolAUSnpn_o7ZqdM9grAZCE72GTAv8_uHNEOr02y8Pn_55umWCB_yrsRa0OO2pqyRtWvtQDomDCTmKtauld3AJOMgn9GhgVexyLDQGyAFMomwF5Dx6RL7hAO-um0QEPKfmArTcLbqhP1M9h1t9x-Dok0R1BmFJvtyo5b1pzgKJT62M2J3I7QZq964-SSglgYRCYebWxkEXD_BUAnS_mwlgcIYTQdu',
      date: '20 Jan 2024',
      alt: 'Chevrolet Corvette C8 rouge sur route de montagne',
      description: 'Photographie automobile mettant en valeur la ligne sportive du véhicule.',
      keywords: ['Chevrolet Corvette', 'voiture sport', 'photographie automobile'],
      status: 'published',
      albumId: 1,
      albumName: 'Automobile'
    },
    {
      id: 2,
      title: 'Urban Portrait',
      category: 'People',
      type: 'Photo',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzdR-cEKxuAmS0_ioeHhSSAnFG6nTpGNmmmmSBPcAhNRa4Wu08p-T2HAhXjtYV0dRzRChjqa6PF_lvfilCLhuQR-j3VPL2r8zikb7pGlUBzNKXYI8YqhajEYI6NQ2sTEmquXyeOknmoZu3ZKMFAHMnHH3MV6gg7-xO5_bDOnEwGh7zokP3qNrRX3S7xWmGCpPrY4hxiAGwg635hLR34QOQb9qD698c5-qfVOGA_AAuKDV9uNWKXjQK',
      date: '12 Jan 2024',
      alt: 'Portrait urbain dans les rues de Paris',
      description: 'Photographie de rue mettant en valeur l\'atmosphère de la ville.',
      keywords: ['portrait urbain', 'photographie de rue', 'Paris'],
      status: 'published',
      albumId: 2,
      albumName: 'Portrait'
    },
    {
      id: 3,
      title: 'City Skyline',
      category: 'Cities',
      type: 'Photo',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4Pqzv-htMPtL7l9C-wKhr4h8r_AkhPUpS4ywa3it7ZlpjyLQ9_-Jt1rqxaPWhgB27Cajy5ZQD5US9Wxs4_cbYDLZbHKq8xUmohvvgjCvFnVMpKfbTCJt0IF8nfqyuK8Jf0yzhp6mMA8XDd-R1_ZPnAbcPu1gPxIkwQTrtyW0JZGtWDec1LIHjuGdYvk2KLuz22qSlbmieYlK8_k9pIMKg_RJq8koEAdO4Qthnw5TFUpq7YHVISCsq',
      date: '8 Jan 2024',
      alt: 'Skyline de nuit de New York',
      description: 'Photographie urbaine capturant l\'énergie de la ville.',
      keywords: ['skyline', 'New York', 'photographie urbaine'],
      status: 'draft',
      albumId: 3,
      albumName: 'Urban'
    },
    {
      id: 4,
      title: 'Wildlife Safari',
      category: 'Animals',
      type: 'Photo',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4GWnoboXR08tQX5eZ-lDFIlK0_Cq9CBYVKYSRbtu6z7U4XJTXAruAilRjyQwLdXHuefgOQ5TyTeZNHG9u4fLG2k2C9He9MQaWiKsvWoya1_2NR5MIOnaw3QHXo7_xm_82KhTZmybmdt35eKQo2VMLh6uBU-rNhTq-gor15vHSqXPAGa76btWtyZTp6K7iTj76cvWzlDLzTfL4Y5NcU1XTqf1Ou9EwN7FBoUdfauB8l6Jg5rElpZP-',
      date: '15 Jan 2024',
      alt: 'Lion dans la savane africaine',
      description: 'Photographie animalière capturant la beauté de la faune sauvage.',
      keywords: ['lion', 'savane africaine', 'photographie animalière'],
      status: 'published',
      albumId: 4,
      albumName: 'Nature'
    }
  ];

  albums: Album[] = [
    {
      id: 1,
      name: 'Automobile',
      cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtwh-yTiMGrGHQFWwYI9yXYGIXolAUSnpn_o7ZqdM9grAZCE72GTAv8_uHNEOr02y8Pn_55umWCB_yrsRa0OO2pqyRtWvtQDomDCTmKtauld3AJOMgn9GhgVexyLDQGyAFMomwF5Dx6RL7hAO-um0QEPKfmArTcLbqhP1M9h1t9x-Dok0R1BmFJvtyo5b1pzgKJT62M2J3I7QZq964-SSglgYRCYebWxkEXD_BUAnS_mwlgcIYTQdu',
      category: 'Cars',
      photosCount: 1,
      status: 'published'
    },
    {
      id: 2,
      name: 'Portrait',
      cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzdR-cEKxuAmS0_ioeHhSSAnFG6nTpGNmmmmSBPcAhNRa4Wu08p-T2HAhXjtYV0dRzRChjqa6PF_lvfilCLhuQR-j3VPL2r8zikb7pGlUBzNKXYI8YqhajEYI6NQ2sTEmquXyeOknmoZu3ZKMFAHMnHH3MV6gg7-xO5_bDOnEwGh7zokP3qNrRX3S7xWmGCpPrY4hxiAGwg635hLR34QOQb9qD698c5-qfVOGA_AAuKDV9uNWKXjQK',
      category: 'People',
      photosCount: 1,
      status: 'published'
    },
    {
      id: 3,
      name: 'Urban',
      cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4Pqzv-htMPtL7l9C-wKhr4h8r_AkhPUpS4ywa3it7ZlpjyLQ9_-Jt1rqxaPWhgB27Cajy5ZQD5US9Wxs4_cbYDLZbHKq8xUmohvvgjCvFnVMpKfbTCJt0IF8nfqyuK8Jf0yzhp6mMA8XDd-R1_ZPnAbcPu1gPxIkwQTrtyW0JZGtWDec1LIHjuGdYvk2KLuz22qSlbmieYlK8_k9pIMKg_RJq8koEAdO4Qthnw5TFUpq7YHVISCsq',
      category: 'Cities',
      photosCount: 1,
      status: 'draft'
    },
    {
      id: 4,
      name: 'Nature',
      cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4GWnoboXR08tQX5eZ-lDFIlK0_Cq9CBYVKYSRbtu6z7U4XJTXAruAilRjyQwLdXHuefgOQ5TyTeZNHG9u4fLG2k2C9He9MQaWiKsvWoya1_2NR5MIOnaw3QHXo7_xm_82KhTZmybmdt35eKQo2VMLh6uBU-rNhTq-gor15vHSqXPAGa76btWtyZTp6K7iTj76cvWzlDLzTfL4Y5NcU1XTqf1Ou9EwN7FBoUdfauB8l6Jg5rElpZP-',
      category: 'Animals',
      photosCount: 1,
      status: 'published'
    }
  ];

  currentFilter = 'all';
  isDropdownOpen = false;
  isDark = false;
  viewMode: 'grid' | 'table' = 'grid';
  pageSize = 10;
  currentPage = 1;
  selectedAlbumId: number | null = null;
  albumViewMode: 'grid' | 'table' = 'grid';

  ngOnInit(): void {
    if (typeof document === 'undefined') return;
    const savedTheme = localStorage.getItem('adminTheme');
    this.isDark = savedTheme === 'dark';
    document.documentElement.setAttribute('data-theme', this.isDark ? 'dark' : 'light');
    document.addEventListener('click', this.closeDropdown);
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', this.closeDropdown);
    }
  }

  get filteredImages(): MediaItem[] {
    let result = this.images;
    if (this.selectedAlbumId !== null) {
      result = result.filter(img => img.albumId === this.selectedAlbumId);
    }
    if (this.currentFilter !== 'all') {
      result = result.filter(img => img.category === this.currentFilter);
    }
    return result;
  }

  get albumImages(): MediaItem[] {
    if (this.selectedAlbumId === null) return [];
    return this.images.filter(img => img.albumId === this.selectedAlbumId);
  }

  get filteredAlbums(): Album[] {
    if (this.currentFilter === 'all') return this.albums;
    return this.albums.filter(album => album.category === this.currentFilter);
  }

  get categoriesCount(): number {
    return [...new Set(this.images.map(img => img.category))].length;
  }

  get pagedImages(): MediaItem[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredImages.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredImages.length / this.pageSize));
  }

  get selectedAlbum(): Album | undefined {
    return this.albums.find(album => album.id === this.selectedAlbumId);
  }

  setFilter(filter: string): void {
    this.currentFilter = filter;
    this.currentPage = 1;
  }

  selectAlbum(albumId: number): void {
    this.selectedAlbumId = albumId;
    this.currentPage = 1;
  }

  clearAlbumSelection(): void {
    this.selectedAlbumId = null;
    this.currentPage = 1;
  }

  setPageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    this.currentPage = Math.max(1, Math.min(page, this.totalPages));
  }

  deleteImage(id: number): void {
    this.images = this.images.filter(img => img.id !== id);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown = (): void => {
    this.isDropdownOpen = false;
  };
}
