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
  aboutTitle = 'About the Photographer';
  aboutDescription = 'I am a professional photographer specializing in capturing authentic moments that tell compelling stories. With over 10 years of experience, I bring a refined artistic vision to every shoot—whether it is a wedding, a corporate event, or a personal portrait session.';

  constructor(private contentService: ContentService) {}

  ngOnInit(): void {
    this.contentService.getSectionPages('home', 'about').subscribe({
      next: (pages: ContentSectionPage[]) => {
        const page = pages[0];
        if (page) {
          this.aboutTitle = page.title || this.aboutTitle;
          this.aboutDescription = page.description || this.aboutDescription;
        }
      },
      error: () => {}
    });
  }
}
