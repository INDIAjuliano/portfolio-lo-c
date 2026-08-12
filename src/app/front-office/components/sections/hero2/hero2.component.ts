import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MediaStateService } from '../../../../core/services/media-state.service';
import { ContentService, ContentSectionPage } from '../../../../core/services/content.service';
import { environment } from '../../../../../environments/environment';
import { merge, Subject, takeUntil } from 'rxjs';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const HERO2_PAGE = 'home';
const HERO2_SECTION = 'hero2';

@Component({
  selector: 'app-hero2',
  standalone: true,
  imports: [],
  templateUrl: './hero2.component.html',
  styleUrl: './hero2.component.css'
})
export class Hero2Component implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('hero2Canvas') hero2CanvasRef!: ElementRef<HTMLCanvasElement>;

  private renderer: MorphRenderer | null = null;
  private currentSlide = 0;
  private slideInterval: any;
  private isTransitioning = false;
  private destroyed = false;
  private destroy$ = new Subject<void>();
  private lastSlideImagesKey = '';

  private readonly defaultSlideImages = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBfvtw81gJIlBNNsilQgp43_PExsCFPAZPLGiLGo28pM5yM1gT0HgVeSobDbDZT39xdp0eu9QT7ujYAvcel-ypfbBOJ0Yaesh3YoT4mRNRRN5_04dfc6eGgfxJKDiaL-_FzZprHlmkwrFHsxGywo-24h_Qt6Oam_MAaOAPbalj5BRiJhhE3sajoLDlW6fmgUaiFBr4pspDf7FPOO52TUDhgvGxSH8eDd-yGZF8KDCri1aeOI672UnPE',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAtwh-yTiMGrGHQFWwYI9yXYGIXolAUSnpn_o7ZqdM9grAZCE72GTAv8_uHNEOr02y8Pn_55umWCB_yrsRa0OO2pqyRtWvtQDomDCTmKtauld3AJOMgn9GhgVexyLDQGyAFMomwF5Dx6RL7hAO-um0QEPKfmArTcLbqhP1M9h1t9x-Dok0R1BmFJvtyo5b1pzgKJT62M2J3I7QZq964-SSglgYRCYebWxkEXD_BUAnS_mwlgcIYTQdu',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBzdR-cEKxuAmS0_ioeHhSSAnFG6nTpGNmmmmSBPcAhNRa4Wu08p-T2HAhXjtYV0dRzRChjqa6PF_lvfilCLhuQR-j3VPL2r8zikb7pGlUBzNKXYI8YqhajEYI6NQ2sTEmquXyeOknmoZu3ZKMFAHMnHH3MV6gg7-xO5_bDOnEwGh7zokP3qNrRX3S7xWmGCpPrY4hxiAGwg635hLR34QOQb9qD698c5-qfVOGA_AAuKDV9uNWKXjQK',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC4Pqzv-htMPtL7l9C-wKhr4h8r_AkhPUpS4ywa3it7ZlpjyLQ9_-Jt1rqxaPWhgB27Cajy5ZQD5US9Wxs4_cbYDLZbHKq8xUmohvvgjCvFnVMpKfbTCJt0IF8nfqyuK8Jf0yzhp6mMA8XDd-R1_ZPnAbcPu1gPxIkwQTrtyW0JZGtWDec1LIHjuGdYvk2KLuz22qSlbmieYlK8_k9pIMKg_RJq8koEAdO4Qthnw5TFUpq7YHVISCsq'
  ];

  private slideImages: string[] = [];

  sectionPage: ContentSectionPage | null = null;

  constructor(private mediaStateService: MediaStateService, private contentService: ContentService) {}

  ngOnInit(): void {
    this.buildDotsAndThumbs();
    if (!document.querySelector('app-loader')) {
      this.initLoader();
    }
    this.initScrollAnimations();
    this.initKeyboardNav();
    this.initBackOfficeBinding();
    this.loadSectionText();
  }

  private loaderDismissedHandler?: () => void;

  ngAfterViewInit(): void {
    if (document.querySelector('app-loader')) {
      this.loaderDismissedHandler = () => {
        const heroContent = document.getElementById('hero2-content');
        const scrollIndicator = document.getElementById('hero2-scroll-indicator');
        if (heroContent) heroContent.classList.add('visible');
        if (scrollIndicator) scrollIndicator.classList.add('visible');
        this.startMorphRenderer();
        this.resetInterval();
      };
      window.addEventListener('loaderDismissed', this.loaderDismissedHandler);
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.destroy$.next();
    this.destroy$.complete();
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
    if (this.renderer) {
      this.renderer.destroy();
      this.renderer = null;
    }
    ScrollTrigger.getAll().forEach(st => st.kill());
    if (this.loaderDismissedHandler) {
      window.removeEventListener('loaderDismissed', this.loaderDismissedHandler);
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.renderer) {
      this.renderer.resize();
    }
  }

  nextSlide(): void {
    const next = (this.currentSlide + 1) % this.slideImages.length;
    this.goToSlide(next);
  }

  prevSlide(): void {
    const prev = (this.currentSlide - 1 + this.slideImages.length) % this.slideImages.length;
    this.goToSlide(prev);
  }

  private goToSlide(index: number): void {
    if (this.isTransitioning || index === this.currentSlide || !this.renderer) return;
    this.isTransitioning = true;
    const from = this.currentSlide;
    const to = index;

    this.renderer.transition(from, to);
    this.updateDotsAndThumbs(to);
    this.scrollThumbIntoView(to);
    this.currentSlide = to;
    this.resetInterval();
  }

  private updateDotsAndThumbs(activeIndex: number): void {
    document.querySelectorAll('.hero2-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === activeIndex);
    });
    document.querySelectorAll('.hero2-thumb').forEach((thumb, i) => {
      thumb.classList.toggle('active', i === activeIndex);
    });
  }

  private scrollThumbIntoView(index: number): void {
    const thumb = document.querySelector(`.hero2-thumb[data-index="${index}"]`);
    if (thumb) {
      thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  private resetInterval(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
    this.slideInterval = setInterval(() => this.nextSlide(), 5000);
  }

  private buildDotsAndThumbs(): void {
    const dotsContainer = document.getElementById('hero2-dots');
    const thumbsContainer = document.getElementById('hero2-thumbs');
    if (!dotsContainer || !thumbsContainer) return;

    this.slideImages.forEach((url, index) => {
      const dot = document.createElement('button');
      dot.className = 'hero2-dot' + (index === 0 ? ' active' : '');
      dot.setAttribute('data-index', String(index));
      dot.addEventListener('click', () => this.goToSlide(index));
      dotsContainer.appendChild(dot);

      const thumb = document.createElement('button');
      thumb.className = 'hero2-thumb' + (index === 0 ? ' active' : '');
      thumb.setAttribute('data-index', String(index));
      thumb.innerHTML = `<img src="${url}" alt="Slide ${index + 1}" loading="lazy">`;
      thumb.addEventListener('click', () => this.goToSlide(index));
      thumbsContainer.appendChild(thumb);
    });
  }

  private initLoader(): void {
    const loaderWrapper = document.getElementById('hero2-loaderWrapper');
    if (loaderWrapper) {
      loaderWrapper.classList.remove('hidden');
    }
    const panels = document.querySelectorAll('.hero2-curtain-panel');
    const curtainContainer = document.getElementById('hero2-curtainContainer');
    const loaderOverlay = document.getElementById('hero2-loaderOverlay');
    const loaderBrand = document.getElementById('hero2-loaderBrand');
    const loaderProgress = document.getElementById('hero2-loaderProgress');
    const loaderProgressFill = document.getElementById('hero2-loaderProgressFill');
    const heroContent = document.getElementById('hero2-content');
    const scrollIndicator = document.getElementById('hero2-scroll-indicator');

    if (!loaderWrapper || !panels.length || !curtainContainer || !loaderOverlay || !loaderBrand || !loaderProgress || !loaderProgressFill) return;

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to(loaderBrand, { duration: 0.6, opacity: 1 })
      .to(loaderProgress, { duration: 0.4, opacity: 1 }, '-=0.2')
      .to(loaderProgressFill, { duration: 1.8, width: '100%', ease: 'power2.inOut' });

    panels.forEach((panel, index) => {
      const inner = panel.querySelector('.hero2-curtain-panel-inner');
      if (!inner) return;
      const delay = 1.8 + index * 0.03;
      gsap.to(inner, {
        duration: 1.0,
        scaleX: 0,
        ease: 'power3.inOut',
        delay,
        transformOrigin: 'left center'
      });
      const isCenter = index > 3 && index < 8;
      gsap.to(panel, {
        duration: 0.6,
        opacity: 0,
        ease: 'power2.out',
        delay: delay + 0.3 + (isCenter ? 0.05 : 0),
        onComplete: () => {
          if (index === panels.length - 1) {
            gsap.to(curtainContainer, { duration: 0.3, opacity: 0, onComplete: () => { curtainContainer.style.display = 'none'; } });
            gsap.to(loaderOverlay, { duration: 0.8, opacity: 0, delay: 0.2 });
            gsap.to(loaderBrand, { duration: 0.4, opacity: 0, delay: 0.1 });
            gsap.to(loaderProgress, { duration: 0.3, opacity: 0 });
            gsap.to(loaderWrapper, {
              duration: 0.5,
              opacity: 0,
              delay: 0.4,
              onComplete: () => {
                loaderWrapper.classList.add('hidden');
                this.startMorphRenderer();
                if (heroContent) heroContent.classList.add('visible');
                if (scrollIndicator) scrollIndicator.classList.add('visible');
                this.resetInterval();
              }
            });
          }
        }
      });
    });
  }

  private startMorphRenderer(): void {
    const canvas = this.hero2CanvasRef?.nativeElement;
    if (!canvas) return;
    this.renderer = new MorphRenderer(canvas);
    this.renderer.init(this.slideImages).then(() => {
      this.renderer?.setOnTransitionComplete(() => {
        this.isTransitioning = false;
      });
    });
  }

  private initScrollAnimations(): void {
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    if (portfolioItems.length) {
      gsap.utils.toArray('.portfolio-item').forEach((item: any, i: number) => {
        gsap.from(item, {
          scrollTrigger: { trigger: item, start: 'top 85%', toggleActions: 'play none none none' },
          duration: 0.8,
          opacity: 0,
          y: 40,
          rotation: i === 0 ? 1 : i === 1 ? -0.5 : 0.5,
          scale: 0.97,
          ease: 'back.out(1.2)',
          delay: i * 0.08
        });
      });
    }

    const aboutImages = document.querySelector('.about-images');
    if (aboutImages) {
      gsap.from('.about-images .img', {
        scrollTrigger: { trigger: '.about-images', start: 'top 80%', toggleActions: 'play none none none' },
        duration: 0.8,
        opacity: 0,
        scale: 0.9,
        stagger: 0.12,
        ease: 'power2.out'
      });
    }

    const aboutContent = document.querySelector('.about-content');
    if (aboutContent) {
      gsap.from('.about-content h2', {
        scrollTrigger: { trigger: '.about-content', start: 'top 80%', toggleActions: 'play none none none' },
        duration: 0.7,
        opacity: 0,
        x: -30,
        ease: 'power2.out'
      });
      gsap.from('.about-content p', {
        scrollTrigger: { trigger: '.about-content', start: 'top 80%', toggleActions: 'play none none none' },
        duration: 0.8,
        opacity: 0,
        y: 20,
        ease: 'power2.out',
        delay: 0.2
      });
      gsap.from('.about-content .btn-primary', {
        scrollTrigger: { trigger: '.about-content', start: 'top 80%', toggleActions: 'play none none none' },
        duration: 0.6,
        opacity: 0,
        scale: 0.9,
        ease: 'back.out(1.4)',
        delay: 0.4
      });
    }

    const passionDark = document.querySelector('.passion-item.dark');
    if (passionDark) {
      gsap.from('.passion-item.dark .content', {
        scrollTrigger: { trigger: '.passion-item.dark', start: 'top 80%', toggleActions: 'play none none none' },
        duration: 0.8,
        opacity: 0,
        x: -30,
        ease: 'power2.out'
      });
    }

    const passionWhite = document.querySelector('.passion-item.white');
    if (passionWhite) {
      gsap.from('.passion-item.white .content', {
        scrollTrigger: { trigger: '.passion-item.white', start: 'top 80%', toggleActions: 'play none none none' },
        duration: 0.8,
        opacity: 0,
        x: 30,
        ease: 'power2.out'
      });
    }

    const offerGrid = document.querySelector('.offer-grid');
    if (offerGrid) {
      gsap.from('.offer-card', {
        scrollTrigger: { trigger: '.offer-grid', start: 'top 85%', toggleActions: 'play none none none' },
        duration: 0.7,
        opacity: 0,
        y: 30,
        scale: 0.95,
        stagger: 0.1,
        ease: 'back.out(1.2)'
      });
    }

    const footer = document.querySelector('.footer');
    if (footer) {
      gsap.from('.footer-inner > *', {
        scrollTrigger: { trigger: '.footer', start: 'top 90%', toggleActions: 'play none none none' },
        duration: 0.6,
        opacity: 0,
        y: 20,
        stagger: 0.08,
        ease: 'power2.out'
      });
    }

    const scrollIndicatorEl = document.querySelector('.scroll-indicator .material-symbols-outlined');
    if (scrollIndicatorEl) {
      gsap.to(scrollIndicatorEl, {
        y: -8,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }
  }

  private initKeyboardNav(): void {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') this.prevSlide();
      if (e.key === 'ArrowRight') this.nextSlide();
    });
  }

  private initBackOfficeBinding(): void {
    this.mediaStateService.loadAll().subscribe({
      next: () => {
        this.loadSlideImages();
      }
    });

    merge(this.mediaStateService.albums$, this.mediaStateService.media$)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadSlideImages();
      });
  }

  private loadSectionText(): void {
    this.contentService.getSectionPages(HERO2_PAGE, HERO2_SECTION).subscribe({
      next: (pages) => {
        this.sectionPage = pages[0] || null;
      },
      error: () => {
        this.sectionPage = null;
      }
    });
  }

  private loadSlideImages(): void {
    const album = this.mediaStateService.currentAlbums.find(
      (a: any) => a.page === HERO2_PAGE && a.section === HERO2_SECTION && a.isPublished
    );

    let newImages: string[] = [];

    if (album && album.mediaIds && album.mediaIds.length > 0) {
      const mediaItems = this.mediaStateService.currentMedia.filter((m: any) =>
        album.mediaIds.includes(m.id)
      );
      newImages = mediaItems
        .filter((m: any) => m.type === 'image' && (m.url || m.imageUrl))
        .map((m: any) => this.getAbsoluteUrl(m.url || m.imageUrl));
    }

    if (newImages.length === 0) {
      newImages = [...this.defaultSlideImages];
    }

    const newKey = JSON.stringify(newImages);
    if (newKey !== this.lastSlideImagesKey) {
      this.lastSlideImagesKey = newKey;
      this.slideImages = newImages;

      if (this.renderer && this.slideImages.length > 0) {
        this.renderer.destroy();
        this.renderer = null;
        if (this.slideInterval) {
          clearInterval(this.slideInterval);
        }
        this.currentSlide = 0;
        this.isTransitioning = false;

        const dotsContainer = document.getElementById('hero2-dots');
        const thumbsContainer = document.getElementById('hero2-thumbs');
        if (dotsContainer) dotsContainer.innerHTML = '';
        if (thumbsContainer) thumbsContainer.innerHTML = '';

        this.buildDotsAndThumbs();

        const loaderWrapper = document.getElementById('hero2-loaderWrapper');
        const heroContent = document.getElementById('hero2-content');
        const scrollIndicator = document.getElementById('hero2-scroll-indicator');

        if (loaderWrapper && !loaderWrapper.classList.contains('hidden')) {
          this.startMorphRenderer();
        } else {
          this.startMorphRenderer();
        }
        if (heroContent) heroContent.classList.add('visible');
        if (scrollIndicator) scrollIndicator.classList.add('visible');
        this.resetInterval();
      }
    }
  }

  private getAbsoluteUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('//')) {
      return (environment.apiUrl.startsWith('https') ? 'https:' : 'http:') + url;
    }
    if (url.startsWith('/')) return environment.apiUrl.replace('/api', '') + url;
    return environment.apiUrl.replace('/api', '') + '/' + url;
  }
}

class MorphRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private uniforms: any = {};
  private textures: WebGLTexture[] = [];
  private aspects: number[] = [];
  private fromIndex = 0;
  private toIndex = 0;
  private progress = 1.0;
  private transitionStart: number | null = null;
  private transitionDuration = 1500;
  private direction = 1;
  private rafId: number | null = null;
  private ready = false;
  private destroyed = false;
  private onTransitionComplete: (() => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  async init(imageUrls: string[]): Promise<void> {
    const gl = this.canvas.getContext('webgl');
    if (!gl) throw new Error('WebGL not supported');
    this.gl = gl;

    const program = createProgram(gl, VERT_SRC, FRAG_SRC);
    this.program = program;
    gl.useProgram(program);

    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    this.uniforms = {
      from: gl.getUniformLocation(program, 'u_from'),
      to: gl.getUniformLocation(program, 'u_to'),
      progress: gl.getUniformLocation(program, 'u_progress'),
      resolution: gl.getUniformLocation(program, 'u_resolution'),
      fromAspect: gl.getUniformLocation(program, 'u_fromAspect'),
      toAspect: gl.getUniformLocation(program, 'u_toAspect'),
      scale: gl.getUniformLocation(program, 'u_scale'),
      direction: gl.getUniformLocation(program, 'u_direction'),
    };

    const images = await Promise.all(imageUrls.map(loadImage));
    this.textures = images.map((img) => uploadTexture(gl, img));
    this.aspects = images.map((img) => img.naturalWidth / img.naturalHeight);

    this.ready = true;
    this.resize();
    this.loop();
  }

  transition(fromIndex: number, toIndex: number, duration = this.transitionDuration): void {
    if (!this.ready || fromIndex === toIndex) return;
    this.fromIndex = fromIndex;
    this.toIndex = toIndex;
    this.progress = 0.0;
    this.transitionStart = performance.now();
    this.transitionDuration = duration;
    this.direction = toIndex > fromIndex ? 1 : -1;
  }

  setOnTransitionComplete(callback: () => void): void {
    this.onTransitionComplete = callback;
  }

  resize(): void {
    const gl = this.gl;
    if (!gl) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    if (w === 0 || h === 0) return;
    this.canvas.width = w;
    this.canvas.height = h;
    gl.viewport(0, 0, w, h);
  }

  private loop = (): void => {
    if (this.destroyed) return;
    this.render();
    this.rafId = requestAnimationFrame(this.loop);
  };

  private render(): void {
    const gl = this.gl;
    if (!gl || !this.ready) return;

    let wasComplete = false;
    if (this.transitionStart !== null && this.progress < 1.0) {
      const elapsed = performance.now() - this.transitionStart;
      const t = Math.min(elapsed / this.transitionDuration, 1.0);
      this.progress = t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2;
      if (this.progress >= 1.0) {
        wasComplete = true;
      }
    }

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[this.fromIndex]);
    gl.uniform1i(this.uniforms.from, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[this.toIndex]);
    gl.uniform1i(this.uniforms.to, 1);

    gl.uniform1f(this.uniforms.progress, this.progress);
    gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
    gl.uniform1f(this.uniforms.fromAspect, this.aspects[this.fromIndex]);
    gl.uniform1f(this.uniforms.toAspect, this.aspects[this.toIndex]);
    gl.uniform1f(this.uniforms.scale, 3.5);
    gl.uniform1f(this.uniforms.direction, this.direction);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    if (wasComplete && this.onTransitionComplete) {
      this.onTransitionComplete();
    }
  }

  destroy(): void {
    this.destroyed = true;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
    if (this.gl) {
      this.textures.forEach((t) => this.gl!.deleteTexture(t));
    }
  }
}

const VERT_SRC = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAG_SRC = `
  precision highp float;
  uniform sampler2D u_from;
  uniform sampler2D u_to;
  uniform float u_progress;
  uniform vec2 u_resolution;
  uniform float u_fromAspect;
  uniform float u_toAspect;
  uniform float u_scale;
  uniform float u_direction;
  varying vec2 v_uv;

  vec3 permute(vec3 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
  }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 v) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * snoise(v);
      v *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  vec2 coverUV(vec2 uv, float imgAspect) {
    float canvasAspect = u_resolution.x / u_resolution.y;
    vec2 scale = (canvasAspect > imgAspect) ? vec2(1.0, imgAspect / canvasAspect) : vec2(canvasAspect / imgAspect, 1.0);
    return (uv - 0.5) * scale + 0.5;
  }

  void main() {
    float edge = 0.15;
    float adjustedProgress = u_progress * (1.0 + 2.0 * edge) - edge;
    float noise = fbm(v_uv * u_scale + vec2(0, u_progress * u_direction)) * .5 + .5;
    noise = smoothstep(0., 2., length(texture2D(u_to, coverUV(v_uv, u_fromAspect)).rgb) + noise);
    float mixFactor = 1.0 - smoothstep(adjustedProgress - edge, adjustedProgress + edge, noise);
    float distort_in = noise * u_progress;
    float distort_out = noise * (1.0 - u_progress);
    vec2 fromUV = coverUV(v_uv + vec2(0, distort_in * 0.5 * u_direction), u_fromAspect);
    vec2 toUV = coverUV(v_uv + vec2(0, distort_out * -0.25 * u_direction), u_toAspect);
    vec4 fromColor = texture2D(u_from, fromUV);
    vec4 toColor = texture2D(u_to, toUV);
    gl_FragColor = mix(fromColor, toColor, mixFactor);
  }
`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const err = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error('Shader compile error: ' + err);
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vertSrc: string, fragSrc: string): WebGLProgram {
  const vert = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vert);
  gl.attachShader(prog, frag);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error('Program link error: ' + gl.getProgramInfoLog(prog));
  }
  return prog;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function uploadTexture(gl: WebGLRenderingContext, img: HTMLImageElement): WebGLTexture {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return tex;
}
