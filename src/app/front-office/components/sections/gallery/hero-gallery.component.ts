import { Component, ElementRef, AfterViewInit, OnDestroy, ViewChild, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ContentService } from '../../../../core/services/content.service';

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_GALLERY_HERO_IMAGES = [
    'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg',
    'https://images.pexels.com/photos/1591448/pexels-photo-1591448.jpeg',
    'https://images.pexels.com/photos/1591449/pexels-photo-1591449.jpeg',
    'https://images.pexels.com/photos/1591450/pexels-photo-1591450.jpeg'
];

const GALLERY_PAGE = 'gallery';
const GALLERY_SECTION = 'hero';

@Component({
  selector: 'app-hero-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-gallery.component.html',
  styleUrls: ['./hero-gallery.component.css']
})
export class HeroGalleryComponent implements AfterViewInit, OnDestroy {
  @ViewChild('heroGalleryCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('heroGalleryScrollIndicator') scrollIndicatorRef!: ElementRef<HTMLDivElement>;

  private contentService = inject(ContentService);
  private renderer: any = null;
  private morphReady = false;
  private currentSlide = 0;
  private slideInterval: any = null;
  private isTransitioning = false;
  private useFallback = false;
  private fallbackImages: HTMLImageElement[] = [];
  private scrollTrigger: any = null;
  private gsapTweens: any[] = [];
  private slideImages: string[] = DEFAULT_GALLERY_HERO_IMAGES;

  ngAfterViewInit(): void {
    if (typeof document === 'undefined') return;
    this.loadCarouselAlbum();
    this.initKeyboardNav();
    this.initScrollManagement();
    this.initGsapAnimations();
  }

  ngOnDestroy(): void {
    this.deactivate();
  }

  private deactivate(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
      this.slideInterval = null;
    }
    if (this.scrollTrigger) {
      this.scrollTrigger.kill();
      this.scrollTrigger = null;
    }
    this.gsapTweens.forEach((t: any) => t.kill());
    this.gsapTweens = [];
  }

  private loadCarouselAlbum(): void {
    const storedCover = this.getStoredCoverImage();
    if (storedCover) {
      this.slideImages = [storedCover];
      this.initDotsAndThumbs();
      this.initCarouselOrFallback();
      this.startSlideshow();
      return;
    }

    this.contentService.getPublishedAlbumsByPageAndSection(GALLERY_PAGE, GALLERY_SECTION).subscribe({
      next: (albums) => {
        const album = albums.find((a: any) => a.isPublished) as any;
        if (album && album.media && album.media.length > 0) {
          this.slideImages = album.media
            .filter((m: any) => m.type === 'image' && (m.url || m.imageUrl))
            .map((m: any) => m.url || m.imageUrl);
        }
        if (this.slideImages.length === 0) {
          this.slideImages = DEFAULT_GALLERY_HERO_IMAGES;
        }
        this.initDotsAndThumbs();
        this.initCarouselOrFallback();
        this.startSlideshow();
      },
      error: () => {
        this.slideImages = DEFAULT_GALLERY_HERO_IMAGES;
        this.initDotsAndThumbs();
        this.initCarouselOrFallback();
        this.startSlideshow();
      }
    });
  }

  private getStoredCoverImage(): string | null {
    if (typeof localStorage === 'undefined') return null;
    const key = `cover-image-${GALLERY_PAGE}-${GALLERY_SECTION}`;
    const raw = localStorage.getItem('coverImages');
    if (!raw) return null;
    try {
      const all = JSON.parse(raw) as Record<string, string>;
      return all[key] || null;
    } catch {
      return null;
    }
  }

  private initCarouselOrFallback(): void {
    if (this.slideImages.length <= 1) {
      this.useFallback = true;
      this.initFallbackCarousel();
      return;
    }
    this.initMorphRenderer();
  }

  private async initMorphRenderer(): Promise<void> {
    this.initFallbackCarousel();

    const initTimeout = setTimeout(() => {
      if (!this.morphReady) {
        console.warn('WebGL init timeout, using fallback images');
        this.morphReady = false;
        this.useFallback = true;
        if (this.renderer) {
          this.renderer.destroy();
          this.renderer = null;
        }
      }
    }, 5000);

    try {
      const canvas = this.canvasRef.nativeElement;
      this.renderer = new HeroGalleryMorphRenderer(canvas);
      this.renderer.setOnTransitionComplete(() => {
        this.isTransitioning = false;
      });
      await this.renderer.init(this.slideImages);
      clearTimeout(initTimeout);

      if (this.useFallback) {
        this.renderer.destroy();
        this.renderer = null;
        return;
      }

      this.morphReady = true;
      canvas.style.display = 'block';
      const fallback = document.getElementById('heroGalleryFallback');
      if (fallback) fallback.style.display = 'none';
    } catch (e) {
      clearTimeout(initTimeout);
      console.warn('WebGL morph renderer failed, using fallback:', e);
      this.morphReady = false;
      this.useFallback = true;
    }
  }

  private initFallbackCarousel(): void {
    const container = document.getElementById('heroGalleryFallback');
    if (!container) return;

    container.innerHTML = '';
    this.fallbackImages = [];

    this.slideImages.forEach((url, i) => {
      const img = document.createElement('img');
      img.src = url;
      img.alt = 'Slide ' + (i + 1);
      img.className = 'hero-gallery-fallback-img' + (i === 0 ? ' active' : '');
      img.loading = 'lazy';
      container.appendChild(img);
      this.fallbackImages.push(img);
    });

    const canvas = this.canvasRef.nativeElement;
    if (canvas) canvas.style.display = 'none';
  }

  private goToSlide(index: number): void {
    if (this.isTransitioning || index === this.currentSlide) return;

    if (this.useFallback) {
      this.goToFallbackSlide(index);
      return;
    }

    if (!this.renderer || !this.morphReady) return;
    this.isTransitioning = true;
    this.renderer.transition(this.currentSlide, index);
    this.updateDotsAndThumbs(index);
    this.currentSlide = index;
    this.resetInterval();
  }

  private goToFallbackSlide(index: number): void {
    if (this.fallbackImages.length === 0) return;
    this.isTransitioning = true;
    this.fallbackImages[this.currentSlide].classList.remove('active');
    this.currentSlide = index;
    this.fallbackImages[this.currentSlide].classList.add('active');
    this.updateDotsAndThumbs(index);
    this.resetInterval();
    setTimeout(() => {
      this.isTransitioning = false;
    }, 500);
  }

  prevSlide(): void {
    const prev = (this.currentSlide - 1 + this.slideImages.length) % this.slideImages.length;
    this.goToSlide(prev);
  }

  nextSlide(): void {
    const next = (this.currentSlide + 1) % this.slideImages.length;
    this.goToSlide(next);
  }

  private updateDotsAndThumbs(activeIndex: number): void {
    const dots = document.querySelectorAll('.hero-gallery-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === activeIndex);
    });
    const thumbs = document.querySelectorAll('.hero-gallery-thumb');
    thumbs.forEach((thumb, i) => {
      thumb.classList.toggle('active', i === activeIndex);
    });
    const activeThumb = thumbs[activeIndex] as HTMLElement | null;
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  private startSlideshow(): void {
    if (this.slideInterval) clearInterval(this.slideInterval);
    this.slideInterval = setInterval(() => this.nextSlide(), 5000);
  }

  private resetInterval(): void {
    if (this.slideInterval) clearInterval(this.slideInterval);
    this.slideInterval = setInterval(() => this.nextSlide(), 5000);
  }

  private initKeyboardNav(): void {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prevSlide();
      if (e.key === 'ArrowRight') this.nextSlide();
    });
  }

  private initScrollManagement(): void {
    if (typeof window === 'undefined') return;

    const scrollIndicator = this.scrollIndicatorRef?.nativeElement;
    if (!scrollIndicator) return;

    scrollIndicator.addEventListener('click', () => {
      const target = document.getElementById('galleryGridSection');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  private initGsapAnimations(): void {
    this.initScrollTrigger();
    this.initDotsAndThumbs();

    const content = document.getElementById('heroGalleryContent');
    if (content) {
      this.gsapTweens.push(gsap.fromTo(content, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 1, ease: 'power2.out', delay: 0.5
      }));
    }

    const scrollIndicator = document.getElementById('heroGalleryScrollIndicator');
    if (scrollIndicator) {
      this.gsapTweens.push(gsap.fromTo(scrollIndicator, { opacity: 0 }, {
        opacity: 1, duration: 0.8, delay: 1.2, ease: 'power2.out'
      }));
    }

    const bounce = document.querySelector('.hero-gallery-scroll-indicator .material-symbols-outlined') as HTMLElement | null;
    if (bounce) {
      this.gsapTweens.push(gsap.to(bounce, {
        y: -8,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      }));
    }
  }

  private initScrollTrigger(): void {
    if (typeof ScrollTrigger === 'undefined') return;

    const heroSection = document.getElementById('heroGalleryHome');
    const content = document.getElementById('heroGalleryContent');
    const scrollIndicator = document.getElementById('heroGalleryScrollIndicator');
    const dots = document.getElementById('heroGalleryDots');
    const thumbs = document.getElementById('heroGalleryThumbs');

    if (!heroSection) return;

    this.scrollTrigger = ScrollTrigger.create({
      trigger: heroSection,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self: any) => {
        const p = self.progress;

        if (content) {
          content.style.opacity = String(1 - p);
          content.style.transform = 'translateY(' + (p * -60) + 'px)';
        }

        if (scrollIndicator) {
          scrollIndicator.style.opacity = String(Math.max(0, 1 - p * 5));
        }

        if (dots) {
          dots.style.opacity = String(Math.max(0, 1 - p * 4));
        }

        if (thumbs) {
          thumbs.style.opacity = String(Math.max(0, 1 - p * 4));
        }
      }
    });
  }

  private initDotsAndThumbs(): void {
    const dotsContainer = document.getElementById('heroGalleryDots');
    const thumbsContainer = document.getElementById('heroGalleryThumbs');
    if (!dotsContainer || !thumbsContainer) return;

    dotsContainer.innerHTML = '';
    thumbsContainer.innerHTML = '';

    this.slideImages.forEach((url, i) => {
      const dot = document.createElement('button');
      dot.className = 'hero-gallery-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('type', 'button');
      dot.addEventListener('click', () => this.goToSlide(i));
      dotsContainer.appendChild(dot);

      const thumb = document.createElement('button');
      thumb.className = 'hero-gallery-thumb' + (i === 0 ? ' active' : '');
      thumb.setAttribute('type', 'button');
      const img = document.createElement('img');
      img.src = url;
      img.alt = 'Slide ' + (i + 1);
      img.loading = 'lazy';
      thumb.appendChild(img);
      thumb.addEventListener('click', () => this.goToSlide(i));
      thumbsContainer.appendChild(thumb);
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.renderer) this.renderer.resize();
  }
}

class HeroGalleryMorphRenderer {
  private _canvas: HTMLCanvasElement;
  private _gl: WebGLRenderingContext | null = null;
  private _prog: WebGLProgram | null = null;
  private _uniforms: any = {};
  private _textures: WebGLTexture[] = [];
  private _aspects: number[] = [];
  private _fromIndex = 0;
  private _toIndex = 0;
  private _progress = 1.0;
  private _transitionStart: number | null = null;
  private _transitionDuration = 1500;
  private _direction = 1;
  private _rafId: number | null = null;
  private _ready = false;
  private _destroyed = false;
  private _onTransitionComplete: (() => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
  }

  async init(imageUrls: string[]): Promise<void> {
    let gl = this._canvas.getContext('webgl') as WebGLRenderingContext | null;
    if (!gl) {
      gl = this._canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
      if (!gl) throw new Error('WebGL not supported');
    }
    this._gl = gl;

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const vertSrc = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragSrc = `
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

    const prog = this.createProgram(gl, vertSrc, fragSrc);
    this._prog = prog;
    gl.useProgram(prog);

    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    this._uniforms = {
      from: gl.getUniformLocation(prog, 'u_from'),
      to: gl.getUniformLocation(prog, 'u_to'),
      progress: gl.getUniformLocation(prog, 'u_progress'),
      resolution: gl.getUniformLocation(prog, 'u_resolution'),
      fromAspect: gl.getUniformLocation(prog, 'u_fromAspect'),
      toAspect: gl.getUniformLocation(prog, 'u_toAspect'),
      scale: gl.getUniformLocation(prog, 'u_scale'),
      direction: gl.getUniformLocation(prog, 'u_direction'),
    };

    const images = await Promise.all(imageUrls.map((url) => this.loadImage(url)));
    this._textures = images.map((img) => this.uploadTexture(gl, img));
    this._aspects = images.map((img) => img.naturalWidth / img.naturalHeight);

    this._ready = true;
    this.resize();
    this.loop();
  }

  transition(fromIndex: number, toIndex: number, duration = this._transitionDuration): void {
    if (!this._ready || fromIndex === toIndex) return;
    this._fromIndex = fromIndex;
    this._toIndex = toIndex;
    this._progress = 0.0;
    this._transitionStart = performance.now();
    this._transitionDuration = duration;
    this._direction = toIndex > fromIndex ? 1 : -1;
  }

  setOnTransitionComplete(callback: () => void): void {
    this._onTransitionComplete = callback;
  }

  resize(): void {
    const gl = this._gl;
    if (!gl) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = this._canvas.getBoundingClientRect();
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    if (w === 0 || h === 0) return;
    this._canvas.width = w;
    this._canvas.height = h;
    gl.viewport(0, 0, w, h);
  }

  private loop = (): void => {
    if (this._destroyed) return;
    this.render();
    this._rafId = requestAnimationFrame(this.loop);
  };

  private render(): void {
    const gl = this._gl;
    if (!gl || !this._ready) return;

    gl.clear(gl.COLOR_BUFFER_BIT);

    let wasComplete = false;

    if (this._transitionStart !== null && this._progress < 1.0) {
      const elapsed = performance.now() - this._transitionStart;
      const t = Math.min(elapsed / this._transitionDuration, 1.0);
      this._progress = t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2;

      if (this._progress >= 1.0) {
        wasComplete = true;
      }
    }

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this._textures[this._fromIndex]);
    gl.uniform1i(this._uniforms.from, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this._textures[this._toIndex]);
    gl.uniform1i(this._uniforms.to, 1);

    gl.uniform1f(this._uniforms.progress, this._progress);
    gl.uniform2f(this._uniforms.resolution, this._canvas.width, this._canvas.height);
    gl.uniform1f(this._uniforms.fromAspect, this._aspects[this._fromIndex]);
    gl.uniform1f(this._uniforms.toAspect, this._aspects[this._toIndex]);
    gl.uniform1f(this._uniforms.scale, 3.5);
    gl.uniform1f(this._uniforms.direction, this._direction);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    if (wasComplete && this._onTransitionComplete) {
      this._onTransitionComplete();
    }
  };

  destroy(): void {
    this._destroyed = true;
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
    }
    if (this._gl) {
      this._textures.forEach((t) => this._gl!.deleteTexture(t));
    }
  }

  private createProgram(gl: WebGLRenderingContext, vertSrc: string, fragSrc: string): WebGLProgram {
    const vert = this.compileShader(gl, gl.VERTEX_SHADER, vertSrc);
    const frag = this.compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error('Program link error: ' + gl.getProgramInfoLog(prog));
    }
    return prog;
  }

  private compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
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

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  private uploadTexture(gl: WebGLRenderingContext, img: HTMLImageElement): WebGLTexture {
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
}
