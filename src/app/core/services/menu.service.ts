import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MenuService {
  isOpen = false;

  toggle(): void {
    this.isOpen = !this.isOpen;
    document.body.style.overflow = this.isOpen ? 'hidden' : '';
  }

  close(): void {
    this.isOpen = false;
    document.body.style.overflow = '';
  }
}
