import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ContentService } from '../../../../core/services/content.service';

gsap.registerPlugin(ScrollTrigger);

const HERO_PAGE = 'home';
const HERO_SECTION = 'hero';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css']
})
export class HeroComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('heroCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('heroText') heroTextRef!: ElementRef<HTMLDivElement>;
  @ViewChild('heroRevealText') heroRevealTextRef!: ElementRef<HTMLDivElement>;
  @ViewChild('revealInner') revealInnerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('scrubBar') scrubBarRef!: ElementRef<HTMLDivElement>;
  @ViewChild('scrollInd') scrollIndRef!: ElementRef<HTMLDivElement>;
  @ViewChild('grad') gradRef!: ElementRef<HTMLDivElement>;
  @ViewChild('bubblesWrapper') bubblesWrapperRef!: ElementRef<HTMLDivElement>;

  private bubblesColors = ['#3b3524',
    '#112b39'];
  private currentSlide = 0;
  private slidesLength = 0;

  private ctx!: CanvasRenderingContext2D;
  private frames: HTMLImageElement[] = [];
  private FRAME_COUNT = 192;
  private currentFrameIdx = 0;
  private targetFrame = 0;
  private displayFrame = 0;
  private rafRunning = false;
  private rafId: number | null = null;

  private heroScrollTrigger: any = null;
  private heroVisibilityTrigger: any = null;
  private activated = false;
  private loaderDismissed = false;
  private canvasReady = false;
  private safetyTimer: any = null;
  private loaderDismissTimer: any = null;
  private pass1Done = 0;
  private pass1Count = 0;
  sectionPage: any = null;

  constructor(private contentService: ContentService) {}

  ngOnInit(): void {
    if (typeof window === 'undefined') return;
    this.loadSectionText();
  }

  private loaderDismissedHandler = () => {
    this.loaderDismissed = true;
    if (this.safetyTimer) {
      clearTimeout(this.safetyTimer);
      this.safetyTimer = null;
    }
    this.loaderDismissTimer = setTimeout(() => {
      this.dismissLoader();
    }, 400);
  };

  ngAfterViewInit(): void {
    if (typeof document === 'undefined') return;
    this.initCanvas();
    this.loadFrames();
    if (typeof window !== 'undefined') {
      window.addEventListener('loaderDismissed', this.loaderDismissedHandler);
    }
    if (!document.querySelector('app-loader')) {
      this.loaderDismissedHandler();
    }
    this.activate();
    this.safetyTimer = setTimeout(() => {
      if (!this.canvasReady) {
        this.loaderDismissed = true;
        this.dismissLoader();
      }
    }, 15000);
  }

  private loadSectionText(): void {
    this.contentService.getSectionPages(HERO_PAGE, HERO_SECTION).subscribe({
      next: (pages: any) => {
        this.sectionPage = pages[0] || null;
      },
      error: () => {
        this.sectionPage = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.deactivate();
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafRunning = false;
    if (this.heroScrollTrigger) {
      this.heroScrollTrigger.kill();
      this.heroScrollTrigger = null;
    }
    if (this.heroVisibilityTrigger) {
      this.heroVisibilityTrigger.kill();
      this.heroVisibilityTrigger = null;
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('loaderDismissed', this.loaderDismissedHandler);
    }
    if (this.safetyTimer) {
      clearTimeout(this.safetyTimer);
      this.safetyTimer = null;
    }
    if (this.loaderDismissTimer) {
      clearTimeout(this.loaderDismissTimer);
      this.loaderDismissTimer = null;
    }
  }

  activate(): void {
    if (this.activated) return;
    this.activated = true;
    if (this.loaderDismissed) {
      this.startHeroEntrance();
      this.initBubbles();
    }
  }

  deactivate(): void {
    if (!this.activated) return;
    this.activated = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafRunning = false;
    if (this.heroScrollTrigger) {
      this.heroScrollTrigger.kill();
      this.heroScrollTrigger = null;
    }
    if (this.heroVisibilityTrigger) {
      this.heroVisibilityTrigger.kill();
      this.heroVisibilityTrigger = null;
    }
  }

  private initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (this.canvasReady && this.frames[this.currentFrameIdx]) {
      this.drawFrame(this.currentFrameIdx);
    }
  }

  @HostListener('window:resize')
   resizeCanvasHost(): void {
    this.resizeCanvas();
  }

  private drawFrame(idx: number): void {
    const img = this.frames[idx];
    if (!img || !img.complete) return;
    const canvas = this.canvasRef.nativeElement;
    const cw = canvas.width,
        ch = canvas.height;
    const iw = img.naturalWidth,
        ih = img.naturalHeight;
    if (!iw || !ih) return;
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale,
        dh = ih * scale;
    const dx = (cw - dw) / 2,
        dy = (ch - dh) / 2;
    this.ctx.clearRect(0, 0, cw, ch);
    this.ctx.drawImage(img, dx, dy, dw, dh);
  }

  private framePath(n: number): string {
    const padded = String(n).padStart(4, '0');
    return `assets/images/hero-frames/frame_${padded}.jpg`;
  }

  private loadFrames(): void {
    const PASS1_STEP = 6;
    this.pass1Done = 0;
    this.pass1Count = Math.ceil(this.FRAME_COUNT / PASS1_STEP);

    for (let i = 1; i <= this.FRAME_COUNT; i += PASS1_STEP) {
      const idx = i - 1;
      const img = new Image();
      img.onload = () => {
        this.frames[idx] = img;
        this.pass1Done++;
        if (idx === 0) this.drawFrame(0);
        if (this.pass1Done >= this.pass1Count) {
          setTimeout(() => {
            this.dismissLoader();
          }, 400);
        }
      };
      img.onerror = () => {
        this.pass1Done++;
        if (this.pass1Done >= this.pass1Count) {
          setTimeout(() => {
            this.dismissLoader();
          }, 400);
        }
      };
      img.src = this.framePath(i);
    }
  }

  private loadRemainingFrames(): void {
    for (let i = 1; i <= this.FRAME_COUNT; i++) {
      const idx = i - 1;
      if (this.frames[idx]) continue;
      const img = new Image();
      img.onload = () => { this.frames[idx] = img; };
      img.onerror = () => {};
      img.src = this.framePath(i);
    }
  }

  private findNearestFrame(idx: number): number | null {
    if (this.frames[idx]) return idx;
    for (let offset = 1; offset < 10; offset++) {
      if (idx - offset >= 0 && this.frames[idx - offset]) return idx - offset;
      if (idx + offset < this.FRAME_COUNT && this.frames[idx + offset]) return idx + offset;
    }
    return null;
  }

  private startRenderLoop(): void {
    if (this.rafRunning) return;
    this.rafRunning = true;
    this.renderLoop();
  }

  private renderLoop(): void {
    if (!this.rafRunning) return;
    const diff = this.targetFrame - this.displayFrame;
    if (Math.abs(diff) > 0.5) {
      this.displayFrame += diff * 0.18;
    } else {
      this.displayFrame = this.targetFrame;
    }
    const idx = Math.max(0, Math.min(this.FRAME_COUNT - 1, Math.round(this.displayFrame)));
    if (idx !== this.currentFrameIdx) {
      this.currentFrameIdx = idx;
      const drawn = this.findNearestFrame(idx);
      if (drawn !== null) this.drawFrame(drawn);
    }
    this.rafId = requestAnimationFrame(() => this.renderLoop());
  }

  private dismissLoader(): void {
    this.canvasReady = true;
    this.drawFrame(0);
    setTimeout(() => {
      this.startHeroEntrance();
      this.initBubbles();
    }, 400);
    this.loadRemainingFrames();
  }

  private startHeroEntrance(): void {
    if (typeof gsap === 'undefined') return;
    gsap.fromTo('.h-eyebrow', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.1, ease: 'power3.out' });
    gsap.fromTo('.h-title', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.1, delay: 0.3, ease: 'power3.out' });
    gsap.fromTo('.h-sub', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, delay: 0.6, ease: 'power3.out' });
    gsap.fromTo('.h-cta-row', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.85, ease: 'power3.out' });
    gsap.fromTo('#sind', { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 1.2, ease: 'power2.out' });
    gsap.fromTo('.side-label', { opacity: 0, x: 12 }, { opacity: 1, x: 0, duration: 0.8, delay: 1, ease: 'power2.out' });
    gsap.fromTo('.welcome-text', { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 1.2, delay: 0.4, ease: 'power3.out' });
    gsap.fromTo('.welcome-line', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, delay: 0.6, stagger: 0.15, ease: 'power3.out' });
    setTimeout(() => {
      this.initScrollTrigger();
    }, 500);
  }

  private initScrollTrigger(): void {
    const heroText = this.heroTextRef.nativeElement;
    const heroRevealText = this.heroRevealTextRef.nativeElement;
    const revealInner = this.revealInnerRef.nativeElement;
    const scrubBar = this.scrubBarRef.nativeElement;
    const scrollInd = this.scrollIndRef.nativeElement;
    const grad = this.gradRef.nativeElement;

    const revealStart = 0.28;
    const revealEnd = 0.60;

    this.heroScrollTrigger = ScrollTrigger.create({
      trigger: '#hero-scroll',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self: any) => {
        const p = self.progress;
        if (p > revealStart && p < revealEnd) {
          const revealProgress = (p - revealStart) / (revealEnd - revealStart);
          const eased = revealProgress < 0.5 ?
            4 * revealProgress * revealProgress * revealProgress :
            1 - Math.pow(-2 * revealProgress + 2, 3) / 2;
          heroRevealText.style.opacity = String(eased);
          revealInner.style.transform = 'translateY(' + (1 - eased) * 100 + '%)';
        } else if (p >= revealEnd) {
          heroRevealText.style.opacity = '1';
          revealInner.style.transform = 'translateY(0%)';
        } else {
          heroRevealText.style.opacity = '0';
          revealInner.style.transform = 'translateY(100%)';
        }
        this.targetFrame = p * (this.FRAME_COUNT - 1);
        scrubBar.style.width = p * 100 + '%';
        const textP = Math.max(0, Math.min(1, (p - 0.08) / 0.32));
        heroText.style.opacity = String(1 - textP);
        heroText.style.transform = 'translateY(' + (textP * -80) + 'px)';
        scrollInd.style.opacity = String(Math.max(0, 1 - p * 14));
        grad.style.opacity = String(Math.min(1, 0.85 + p * 0.15));
      }
    });

    this.heroVisibilityTrigger = ScrollTrigger.create({
      trigger: '#hero-scroll',
      start: 'top top',
      end: 'bottom bottom',
      onEnter: () => {
        this.rafRunning = true;
        this.renderLoop();
      },
      onLeave: () => {
        this.rafRunning = false;
      },
      onEnterBack: () => {
        this.rafRunning = true;
        this.renderLoop();
      }
    });
  }

  private initBubbles(): void {
    if (typeof gsap === 'undefined' || typeof document === 'undefined') return;

    const wrapper = this.bubblesWrapperRef.nativeElement;
    const bubblesGroup = wrapper.querySelector('#bubbles');

    if (!bubblesGroup) return;

    bubblesGroup.querySelectorAll('path').forEach((path: any) => {
      const rand = Math.floor(Math.random() * this.bubblesColors.length);
      gsap.set(path, { fill: this.bubblesColors[rand] });
    });

    this.setTexts();
  }

  private setTexts(): void {
    const wrapper = this.bubblesWrapperRef.nativeElement;
    const texts = wrapper.querySelector('#svg-texts');
    if (!texts) return;

    const slide = wrapper.querySelector(`.slide[count="${this.currentSlide}"]`) as HTMLElement | null;
    if (!slide) return;

    const t1 = (slide.getAttribute('data-1') || '').toUpperCase();
    const t2 = (slide.getAttribute('data-2') || '').toUpperCase();

    const textEls = texts.querySelectorAll('text');
    if (textEls[0]) textEls[0].textContent = t1;
    if (textEls[1]) textEls[1].textContent = t2;
  }
}
