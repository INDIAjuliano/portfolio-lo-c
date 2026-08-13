import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { ContentService, ContentSectionPage } from '../../../core/services/content.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  currentYear = new Date().getFullYear();
  siteLogo: string | null = null;
  siteLogoAlt = 'LOÏC Photography';
  copyrightText = `© ${this.currentYear} LOÏC Photography. All rights reserved.`;
  emailText = 'contact@loic-photography.com';
  phoneText = '+261 32 85 126 30';
  locationText = 'Madagascar';

  constructor(private contentService: ContentService) {}

  ngOnInit(): void {
    this.contentService.getSiteLogo().subscribe({
      next: (logo: any) => {
        if (logo && logo.logoUrl) {
          this.siteLogo = logo.logoUrl;
          this.siteLogoAlt = logo.name || 'LOÏC Photography';
        }
      },
      error: () => {
        this.siteLogo = null;
      }
    });

    this.contentService.getSectionPages('home', 'footer global').subscribe({
      next: (pages) => {
        const page = pages[0];
        if (page) {
          if (page.title) {
            this.emailText = page.title;
          }
          if (page.description) {
            this.phoneText = page.description;
          }
          if (page.content) {
            this.copyrightText = page.content;
          }
        }
      },
      error: () => {}
    });
  }
}
