import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../icon/icon.component';
import { ContentService, ContentSectionPage } from '../../../../core/services/content.service';

@Component({
  selector: 'app-offer',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.css']
})
export class OfferComponent {
  offers = [
    { icon: 'photo_camera', label: 'Wedding' },
    { icon: 'portrait', label: 'Portrait' },
    { icon: 'event', label: 'Corporate' },
    { icon: 'travel_explore', label: 'Lifestyle' },
    { icon: 'movie', label: 'Fashion' }
  ];
  sectionPage: ContentSectionPage | null = null;

  constructor(private contentService: ContentService) {}

  ngOnInit(): void {
    this.contentService.getSectionPages('home', 'offer').subscribe({
      next: (pages) => {
        this.sectionPage = pages[0] || null;
      },
      error: () => {
        this.sectionPage = null;
      }
    });
  }
}
