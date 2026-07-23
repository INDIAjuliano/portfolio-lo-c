import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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

  private ctx!: CanvasRenderingContext2D;
  private frames: HTMLImageElement[] = [];
  private FRAME_COUNT = 192;
  private currentFrameIdx = 0;
  private targetFrame = 0;
  private displayFrame = 0;
  private rafRunning = false;
  private rafId: number | null = null;

  ngOnInit(): void {
    gsap.registerPlugin(ScrollTrigger);
  }

  ngAfterViewInit(): void {
    if (typeof document === 'undefined') return;
    this.initCanvas();
    this.loadFrames();
    window.addEventListener('loaderDismissed', () => {
      setTimeout(() => this.startHeroEntrance(), 400);
    });
  }

  ngOnDestroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    ScrollTrigger.getAll().forEach(st => st.kill());
  }

  private initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
  }

  @HostListener('window:resize')
   resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (this.frames[this.currentFrameIdx]) {
      this.drawFrame(this.currentFrameIdx);
    }
  }

  private drawFrame(idx: number): void {
    const img = this.frames[idx];
    if (!img || !img.complete) return;

    const canvas = this.canvasRef.nativeElement;
    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    if (!iw || !ih) return;

    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale, dh = ih * scale;
    const dx = (cw - dw) / 2, dy = (ch - dh) / 2;

    this.ctx.clearRect(0, 0, cw, ch);
    this.ctx.drawImage(img, dx, dy, dw, dh);
  }

  private loadFrames(): void {
    const PASS1_STEP = 6;
    let loaded = 0;
    const total = Math.ceil(this.FRAME_COUNT / PASS1_STEP);

    for (let i = 1; i <= this.FRAME_COUNT; i += PASS1_STEP) {
      const idx = i - 1;
      const img = new Image();
      img.onload = () => {
        this.frames[idx] = img;
        loaded++;
        if (idx === 0) this.drawFrame(0);
        if (loaded >= total) {
          this.initScrollTrigger();
          this.startRenderLoop();
          this.loadRemainingFrames();
        }
      };
      img.onerror = () => {
        loaded++;
        if (loaded >= total) {
          this.initScrollTrigger();
          this.startRenderLoop();
          this.loadRemainingFrames();
        }
      };
      img.src = this.framePath(i);
    }
  }

  private framePath(n: number): string {
    const padded = String(n).padStart(4, '0');
    return `https://rassweiler-it.de/images/codepen/frames/frame_${padded}.jpg`;
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

  private startHeroEntrance(): void {
    if (typeof gsap === 'undefined') return;
    gsap.fromTo('.h-eyebrow', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.1, ease: 'power3.out' });
    gsap.fromTo('.h-title', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.1, delay: 0.3, ease: 'power3.out' });
    gsap.fromTo('.h-sub', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, delay: 0.6, ease: 'power3.out' });
    gsap.fromTo('.h-cta-row', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.85, ease: 'power3.out' });
    gsap.fromTo('.scroll-ind', { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 1.2, ease: 'power2.out' });
    gsap.fromTo('.side-label', { opacity: 0, x: 12 }, { opacity: 1, x: 0, duration: 0.8, delay: 1, ease: 'power2.out' });
  }

  private initScrollTrigger(): void {
    const revealStart = 0.28;
    const revealEnd = 0.60;
    const heroText = this.heroTextRef.nativeElement;
    const heroRevealText = this.heroRevealTextRef.nativeElement;
    const revealInner = this.revealInnerRef.nativeElement;
    const scrubBar = this.scrubBarRef.nativeElement;
    const scrollInd = this.scrollIndRef.nativeElement;
    const grad = this.gradRef.nativeElement;

    ScrollTrigger.create({
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
        heroText.style.transform = 'translateY(' + textP * -80 + 'px)';

        scrollInd.style.opacity = String(Math.max(0, 1 - p * 14));
        grad.style.opacity = String(Math.min(1, 0.85 + p * 0.15));
      }
    });
  }
}
