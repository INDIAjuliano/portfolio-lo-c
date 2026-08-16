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
  @Output() ready = new EventEmitter<void>();

  siteLogo: string | null = null;
  siteLogoAlt = 'LOÏC Photography';
  private isDismissed = false;
  private isReady = false;

  constructor(private contentService: ContentService) { }

  ngAfterViewInit(): void {
    if (typeof document === 'undefined') return;
    this.loadSiteLogo();
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

  startProgress(): void {
    const fill = this.loaderProgressFill.nativeElement;
    const brand = this.loaderBrand.nativeElement;

    gsap.to(fill, {
      width: '100%',
      duration: 2.2,
      ease: 'power2.inOut',
      onComplete: () => {
        this.isReady = true;
        this.ready.emit();
      }
    });

    gsap.to(brand, {
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out'
    });
  }

  dismiss(): void {
    if (this.isDismissed) return;
    this.isDismissed = true;

    const fill = this.loaderProgressFill.nativeElement;
    const brand = this.loaderBrand.nativeElement;
    const progress = this.loaderProgress.nativeElement;
    const overlay = this.loaderOverlay.nativeElement;
    const panels = this.curtainContainer.nativeElement.querySelectorAll('.curtain-panel-inner');

    gsap.killTweensOf(fill);

    const tl = gsap.timeline({
      onComplete: () => {
        const event = new CustomEvent('loaderDismissed');
        window.dispatchEvent(event);
        this.dismissed.emit();
      }
    });

    tl.to([brand, progress], {
      opacity: 0,
      duration: 0.4,
      stagger: 0.05
    })
    .to(overlay, {
      opacity: 0,
      duration: 0.5,
      delay: 0.2
    })
    .to(panels, {
      scaleX: 0,
      duration: 1,
      stagger: 0.06,
      ease: 'power3.inOut',
      delay: 0.3
    })
    .to(this.loaderWrapper.nativeElement, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        this.loaderWrapper.nativeElement.classList.add('hidden');
      }
    });
  }
}
