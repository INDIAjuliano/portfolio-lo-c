import { Injectable } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Injectable({ providedIn: 'root' })
export class ScrollService {
  initScrollReveal(): void {
    if (typeof document === 'undefined' || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.rv').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('in');
      }
      observer.observe(el);
    });
  }

  initGSAPAnimations(): void {
    if (typeof window === 'undefined') return;
    const gsapLib = (window as any).gsap;
    const ScrollTriggerLib = (window as any).ScrollTrigger;
    if (gsapLib && ScrollTriggerLib) {
      gsap.registerPlugin(ScrollTrigger);
    }
    this.initScrollAnimations();
  }

  initScrollAnimations(): void {
    if (typeof gsap === 'undefined') return;
  }

  initPortfolioHover(): void {}

  disconnectScrollReveal(): void {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('.rv.in').forEach(el => el.classList.remove('in'));
  }

  killGSAPAnimations(): void {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.getAll().forEach((st: any) => st.kill());
    }
    if (typeof gsap !== 'undefined') {
      gsap.killTweensOf('*');
    }
  }

  removePortfolioHover(): void {}
}
