import { Component, AfterViewInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { ContentService } from '../../../core/services/content.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements AfterViewInit {
  @ViewChild('loaderWrapper') loaderWrapper!: ElementRef<HTMLDivElement>;
  @ViewChild('curtainContainer') curtainContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('loaderOverlay') loaderOverlay!: ElementRef<HTMLDivElement>;
  @ViewChild('loaderBrand') loaderBrand!: ElementRef<HTMLDivElement>;
  @ViewChild('loaderProgress') loaderProgress!: ElementRef<HTMLDivElement>;
  @ViewChild('loaderProgressFill') loaderProgressFill!: ElementRef<HTMLDivElement>;
  @Output() dismissed = new EventEmitter<void>();

  siteLogo: string | null = null;
  siteLogoAlt = 'LOÏC Photography';

  constructor(private contentService: ContentService) {}

  ngAfterViewInit(): void {
    if (typeof document === 'undefined') return;
    this.loadSiteLogo();
    setTimeout(() => this.dismissLoader(), 2500);
  }

  private loadSiteLogo(): void {
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
  }

  dismissLoader(): void {
    const panels = this.curtainContainer.nativeElement.querySelectorAll('.curtain-panel-inner');
    const overlay = this.loaderOverlay.nativeElement;
    const brand = this.loaderBrand.nativeElement;
    const progress = this.loaderProgress.nativeElement;
    const fill = this.loaderProgressFill.nativeElement;

    gsap.to(fill, { width: '100%', duration: 0.8, ease: 'power2.inOut', onComplete: () => {
      gsap.to([brand, progress], { opacity: 0, duration: 0.35, stagger: 0.05 });
      gsap.to(overlay, { opacity: 0, duration: 0.4, delay: 0.25 });
      gsap.to(panels, {
        scaleX: 0,
        duration: 0.8,
        stagger: 0.06,
        ease: 'power3.inOut',
        delay: 0.35,
        onComplete: () => {
          const event = new CustomEvent('loaderDismissed');
          window.dispatchEvent(event);
          this.dismissed.emit();
        }
      });
    }});
  }
}
