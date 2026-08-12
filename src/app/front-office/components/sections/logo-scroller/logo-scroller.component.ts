import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, ContentPartner } from '../../../../core/services/content.service';
import { environment } from '../../../../../environments/environment';

const DEFAULT_PARTNERS: ContentPartner[] = [
  { id: 0, name: 'Greenleaf', description: 'Greenleaf Logo', logoUrl: 'https://assets.codepen.io/191814/logo-geenleaf.png', linkUrl: '', position: 1, isPublished: true },
  { id: 0, name: 'NFL', description: 'National Football League (NFL) Logo', logoUrl: 'https://assets.codepen.io/191814/logo-nfl.png', linkUrl: '', position: 2, isPublished: true },
  { id: 0, name: 'Coca-Cola', description: 'Coca-Cola Logo', logoUrl: 'https://assets.codepen.io/191814/logo-coca-cola+%281%29.png', linkUrl: '', position: 3, isPublished: true },
  { id: 0, name: 'Prime Video', description: 'Amazon Prime Video Logo', logoUrl: 'https://assets.codepen.io/191814/logo-prime-video.png', linkUrl: '', position: 4, isPublished: true },
  { id: 0, name: 'BMW', description: 'BMW Logo', logoUrl: 'https://assets.codepen.io/191814/logo-BMW.png', linkUrl: '', position: 5, isPublished: true },
  { id: 0, name: "Barry's Bootcamp", description: "Barry's Bootcamp Logo", logoUrl: 'https://assets.codepen.io/191814/logo-barrys.png', linkUrl: '', position: 6, isPublished: true },
  { id: 0, name: 'Los Angeles Ballet', description: 'Los Angeles Ballet Logo', logoUrl: 'https://assets.codepen.io/191814/logo-la-ballet.png', linkUrl: '', position: 7, isPublished: true },
  { id: 0, name: 'Warner Brothers', description: 'Warner Brothers Logo', logoUrl: 'https://assets.codepen.io/191814/logo-warner-brothers+%281%29.png', linkUrl: '', position: 8, isPublished: true },
  { id: 0, name: 'Prime Video', description: 'Amazon Prime Video Logo', logoUrl: 'https://assets.codepen.io/191814/logo-prime-video.png', linkUrl: '', position: 9, isPublished: true },
  { id: 0, name: 'Louis Vuitton', description: 'Louis Vuitton Logo', logoUrl: 'https://assets.codepen.io/191814/Louis-V.png', linkUrl: '', position: 10, isPublished: true }
];

@Component({
  selector: 'app-logo-scroller',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logo-scroller.component.html',
  styleUrls: ['./logo-scroller.component.css']
})
export class LogoScrollerComponent implements OnInit {
  partners: ContentPartner[] = [];
  isLoading = true;

  constructor(private contentService: ContentService) {}

  ngOnInit(): void {
    this.loadPartners();
  }

  private loadPartners(): void {
    this.contentService.getPublishedPartners().subscribe({
      next: (partners) => {
        if (partners && partners.length > 0) {
          this.partners = partners.map((p: ContentPartner) => ({
            ...p,
            logoUrl: this.getAbsoluteUrl(p.logoUrl),
            linkUrl: p.linkUrl || undefined
          }));
        } else {
          this.partners = DEFAULT_PARTNERS.map(p => ({ ...p, logoUrl: this.getAbsoluteUrl(p.logoUrl) }));
        }
        this.isLoading = false;
      },
      error: () => {
        this.partners = DEFAULT_PARTNERS.map(p => ({ ...p, logoUrl: this.getAbsoluteUrl(p.logoUrl) }));
        this.isLoading = false;
      }
    });
  }

  private getAbsoluteUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('//')) {
      return (environment.apiUrl.startsWith('https') ? 'https:' : 'http:') + url;
    }
    if (url.startsWith('/')) return environment.apiUrl.replace('/api', '') + url;
    return environment.apiUrl.replace('/api', '') + '/' + url;
  }
}
