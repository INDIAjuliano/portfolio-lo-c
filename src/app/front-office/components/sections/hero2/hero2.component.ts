import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SLIDE_IMAGES = [
  'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1265&h=362&fit=crop',
  'https://images.unsplash.com/photo-1478720568477-152d9b164e63?w=1265&h=362&fit=crop',
  'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=1265&h=362&fit=crop',
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1265&h=362&fit=crop'
];

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
    m = m * m; m = m * m;
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
    float value = 0.0; float amplitude = 0.5;
    for (int i = 0; i < 5; i++) { value += amplitude * snoise(v); v *= 2.0; amplitude *= 0.5; }
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

class Hero2MorphRenderer {
  private _canvas: HTMLCanvasElement;
  private _gl: WebGLRenderingContext;
  private _prog: WebGLProgram;
  private _uniforms: Record<string, WebGLUniformLocation>;
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
    const gl = canvas.getContext('webgl');
    if (!gl) throw new Error('WebGL not supported');
    this._gl = gl;
    const prog = createProgram(gl, VERT_SRC, FRAG_SRC);
    this._prog = prog;
    gl.useProgram(prog);
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    this._uniforms = {
      from: gl.getUniformLocation(prog, 'u_from')!,
      to: gl.getUniformLocation(prog, 'u_to')!,
      progress: gl.getUniformLocation(prog, 'u_progress')!,
      resolution: gl.getUniformLocation(prog, 'u_resolution')!,
      fromAspect: gl.getUniformLocation(prog, 'u_fromAspect')!,
      toAspect: gl.getUniformLocation(prog, 'u_toAspect')!,
      scale: gl.getUniformLocation(prog, 'u_scale')!,
      direction: gl.getUniformLocation(prog, 'u_direction')!,
    } as Record<string, WebGLUniformLocation>;
  }

  async init(imageUrls: string[]) {
    const images = await Promise.all(imageUrls.map(loadImage));
    this._textures = images.map((img) => uploadTexture(this._gl, img));
    this._aspects = images.map((img) => img.naturalWidth / img.naturalHeight);
    this._ready = true;
    this.resize();
    this._loop();
  }

  transition(fromIndex: number, toIndex: number, duration = this._transitionDuration) {
    if (!this._ready || fromIndex === toIndex) return;
    this._fromIndex = fromIndex;
    this._toIndex = toIndex;
    this._progress = 0.0;
    this._transitionStart = performance.now();
    this._transitionDuration = duration;
    this._direction = toIndex > fromIndex ? 1 : -1;
  }

  setOnTransitionComplete(callback: () => void) {
    this._onTransitionComplete = callback;
  }

  resize() {
    const gl = this._gl;
    const dpr = window.devicePixelRatio || 1;
    const rect = this._canvas.getBoundingClientRect();
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    if (w === 0 || h === 0) return;
    this._canvas.width = w;
    this._canvas.height = h;
    gl.viewport(0, 0, w, h);
  }

  private _loop() {
    if (this._destroyed) return;
    this._render();
    this._rafId = requestAnimationFrame(() => this._loop());
  }

  private _render() {
    const gl = this._gl;
    if (!gl || !this._ready) return;
    let wasComplete = false;

    if (this._transitionStart !== null && this._progress < 1.0) {
      const elapsed = performance.now() - this._transitionStart;
      const t = Math.min(elapsed / this._transitionDuration, 1.0);
      this._progress = t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2;
      if (this._progress >= 1.0) wasComplete = true;
    }

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this._textures[this._fromIndex]);
    gl.uniform1i(this._uniforms['from'], 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this._textures[this._toIndex]);
    gl.uniform1i(this._uniforms['to'], 1);
    gl.uniform1f(this._uniforms['progress'], this._progress);
    gl.uniform2f(this._uniforms['resolution'], this._canvas.width, this._canvas.height);
    gl.uniform1f(this._uniforms['fromAspect'], this._aspects[this._fromIndex]);
    gl.uniform1f(this._uniforms['toAspect'], this._aspects[this._toIndex]);
    gl.uniform1f(this._uniforms['scale'], 3.5);
    gl.uniform1f(this._uniforms['direction'], this._direction);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    if (wasComplete && this._onTransitionComplete) {
      this._onTransitionComplete();
    }
  }

  destroy() {
    this._destroyed = true;
    cancelAnimationFrame(this._rafId!);
    if (this._gl) {
      this._textures.forEach((t) => this._gl.deleteTexture(t));
    }
  }
}

@Component({
  selector: 'app-hero2',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero2.component.html',
  styleUrls: ['./hero2.component.css']
})
export class Hero2Component implements AfterViewInit, OnDestroy {

  @ViewChild('hero2Canvas') hero2CanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('hero2ScrollIndicator') hero2ScrollIndicatorRef!: ElementRef<HTMLDivElement>;

  private renderer: Hero2MorphRenderer | null = null;
  private morphReady = false;
  private currentSlide = 0;
  private slideInterval: number | null = null;
  private isTransitioning = false;
  private scrollIndicatorHidden = false;
  private hero2ScrollTrigger: any = null;
  private hero2GsapTweens: any[] = [];
  private activated = false;
  private navScrollHandler = (): void => {
    const navbar = document.getElementById('navbar');
    const logoWrapper = document.getElementById('logoWrapper');
    if (navbar && typeof window !== 'undefined' && window.scrollY > 10) {
      navbar.classList.add('scrolled');
    } else if (navbar) {
      navbar.classList.remove('scrolled');
    }
    if (logoWrapper && typeof window !== 'undefined' && window.scrollY > 10) {
      logoWrapper.classList.add('scrolled');
    } else if (logoWrapper) {
      logoWrapper.classList.remove('scrolled');
    }
  };

  ngAfterViewInit(): void {
    if (typeof document === 'undefined') return;
    this.initMorphRenderer();
    this.initKeyboardNav();
    this.activate();
  }

  ngOnDestroy(): void {
    this.deactivate();
  }

  activate(): void {
    if (this.activated) return;
    this.activated = true;
    this.initGsapAnimations();
    this.startSlideshow();
    this.initScrollManagement();
  }

  deactivate(): void {
    if (!this.activated) return;
    this.activated = false;
    if (this.slideInterval) clearInterval(this.slideInterval);
    this.slideInterval = null;
    if (this.hero2ScrollTrigger) {
      this.hero2ScrollTrigger.kill();
      this.hero2ScrollTrigger = null;
    }
    this.hero2GsapTweens.forEach(t => t.kill());
    this.hero2GsapTweens = [];
    window.removeEventListener('scroll', this.navScrollHandler);
  }

  private async initMorphRenderer(): Promise<void> {
    try {
      const canvas = this.hero2CanvasRef.nativeElement;
      this.renderer = new Hero2MorphRenderer(canvas);
      this.renderer.setOnTransitionComplete(() => {
        this.isTransitioning = false;
      });
      await this.renderer.init(SLIDE_IMAGES);
      this.morphReady = true;
    } catch (e) {
      console.warn('WebGL morph renderer failed, falling back:', e);
      this.morphReady = false;
    }
  }


  private goToSlide(index: number): void {
    if (this.isTransitioning || index === this.currentSlide || !this.renderer || !this.morphReady) return;
    this.isTransitioning = true;
    this.renderer.transition(this.currentSlide, index);
    this.updateDotsAndThumbs(index);
    this.currentSlide = index;
    this.resetInterval();
  }

  private nextHero2Slide(): void {
    const next = (this.currentSlide + 1) % SLIDE_IMAGES.length;
    this.goToSlide(next);
  }

  private prevHero2Slide(): void {
    const prev = (this.currentSlide - 1 + SLIDE_IMAGES.length) % SLIDE_IMAGES.length;
    this.goToSlide(prev);
  }

  private updateDotsAndThumbs(activeIndex: number): void {
    const dots = document.querySelectorAll('.hero2-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('hero2-dot-active', i === activeIndex);
    });
    const thumbs = document.querySelectorAll('.hero2-thumb');
    thumbs.forEach((thumb, i) => {
      thumb.classList.toggle('hero2-thumb-active', i === activeIndex);
    });
    const activeThumb = thumbs[activeIndex] as HTMLElement | null;
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  private startSlideshow(): void {
    if (this.slideInterval) clearInterval(this.slideInterval);
    this.slideInterval = window.setInterval(() => this.nextHero2Slide(), 5000);
  }

  private resetInterval(): void {
    if (this.slideInterval) clearInterval(this.slideInterval);
    this.slideInterval = window.setInterval(() => this.nextHero2Slide(), 5000);
  }

  private initKeyboardNav(): void {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prevHero2Slide();
      if (e.key === 'ArrowRight') this.nextHero2Slide();
    });
  }

  private initScrollManagement(): void {
    if (typeof window === 'undefined') return;

    const scrollIndicator = this.hero2ScrollIndicatorRef?.nativeElement;
    if (!scrollIndicator) return;

    scrollIndicator.addEventListener('click', () => {
      const target = document.getElementById('services');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  private initHero2ScrollTrigger(): void {
    if (typeof ScrollTrigger === 'undefined') return;

    const heroSection = document.getElementById('hero2-home');
    const hero2Content = document.getElementById('hero2-content');
    const hero2ScrollIndicator = document.getElementById('hero2-scroll-indicator');
    const hero2Dots = document.getElementById('hero2-dots');
    const hero2Thumbs = document.getElementById('hero2-thumbs');

    if (!heroSection) return;

    this.hero2ScrollTrigger = ScrollTrigger.create({
      trigger: heroSection,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self: any) => {
        const p = self.progress;

        if (hero2Content) {
          hero2Content.style.opacity = String(1 - p);
          hero2Content.style.transform = 'translateY(' + (p * -60) + 'px)';
        }

        if (hero2ScrollIndicator) {
          hero2ScrollIndicator.style.opacity = String(Math.max(0, 1 - p * 5));
        }

        if (hero2Dots) {
          hero2Dots.style.opacity = String(Math.max(0, 1 - p * 4));
        }

        if (hero2Thumbs) {
          hero2Thumbs.style.opacity = String(Math.max(0, 1 - p * 4));
        }
      }
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.renderer) this.renderer.resize();
  }

  private initGsapAnimations(): void {
    this.initHero2ScrollTrigger();
    this.initHero2DotsAndThumbs();

    const hero2Content = document.getElementById('hero2-content');
    if (hero2Content) {
      this.hero2GsapTweens.push(gsap.fromTo(hero2Content, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 1, ease: 'power2.out', delay: 0.5
      }));
    }

    const hero2ScrollIndicator = document.getElementById('hero2-scroll-indicator');
    if (hero2ScrollIndicator) {
      this.hero2GsapTweens.push(gsap.fromTo(hero2ScrollIndicator, { opacity: 0 }, {
        opacity: 1, duration: 0.8, delay: 1.2, ease: 'power2.out'
      }));
    }

    const hero2Bounce = document.querySelector('.hero2-scroll-indicator .material-symbols-outlined') as HTMLElement | null;
    if (hero2Bounce) {
      this.hero2GsapTweens.push(gsap.to(hero2Bounce, {
        y: -8,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      }));
    }

    window.addEventListener('scroll', this.navScrollHandler);
  }

  private initHero2DotsAndThumbs(): void {
    const dotsContainer = document.getElementById('hero2-dots');
    const thumbsContainer = document.getElementById('hero2-thumbs');
    if (!dotsContainer || !thumbsContainer) return;

    dotsContainer.innerHTML = '';
    thumbsContainer.innerHTML = '';

    SLIDE_IMAGES.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'hero2-dot' + (i === 0 ? ' hero2-dot-active' : '');
      dot.setAttribute('type', 'button');
      dot.addEventListener('click', () => this.goToSlide(i));
      dotsContainer.appendChild(dot);

      const thumb = document.createElement('button');
      thumb.className = 'hero2-thumb' + (i === 0 ? ' hero2-thumb-active' : '');
      thumb.setAttribute('type', 'button');
      const img = document.createElement('img');
      img.src = SLIDE_IMAGES[i];
      img.alt = 'Slide ' + (i + 1);
      img.loading = 'lazy';
      thumb.appendChild(img);
      thumb.addEventListener('click', () => this.goToSlide(i));
      thumbsContainer.appendChild(thumb);
    });
  }
}
