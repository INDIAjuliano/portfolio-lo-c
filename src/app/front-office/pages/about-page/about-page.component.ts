import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, ContentSectionPage } from '../../../core/services/content.service';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-page.component.html',
  styleUrls: ['./about-page.component.css']
})
export class AboutPageComponent implements OnInit {
  sectionPages: ContentSectionPage[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  constructor(private contentService: ContentService) {}

  ngOnInit(): void {
    this.loadContent();
  }

  loadContent(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.contentService.getSectionPages('about', 'main').subscribe({
      next: (pages) => {
        this.sectionPages = pages;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load about page content', err);
        this.errorMessage = 'Impossible de charger le contenu.';
        this.isLoading = false;
      }
    });
  }
}
