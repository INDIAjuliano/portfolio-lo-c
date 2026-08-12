import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MDI_ICONS } from '../../../assets/icons/icons.constants';

@Injectable({
  providedIn: 'root'
})
export class IconsService {
  private readonly cache = new Map<string, SafeHtml>();

  constructor(private sanitizer: DomSanitizer) {
    for (const [name, svgString] of Object.entries(MDI_ICONS)) {
      this.cache.set(name, this.sanitizer.bypassSecurityTrustHtml(svgString));
    }
  }

  getIcon(name: string): SafeHtml | null {
    return this.cache.get(name) ?? null;
  }

  getIconNames(): string[] {
    return Array.from(this.cache.keys());
  }
}
