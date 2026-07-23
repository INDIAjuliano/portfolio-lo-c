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

    document.querySelectorAll('.rv').forEach(el => observer.observe(el));
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

    gsap.registerPlugin(ScrollTrigger);

    // Portfolio
    gsap.utils.toArray('.portfolio-item').forEach((item: any, i: number) => {
      gsap.from(item, {
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        duration: 0.8,
        opacity: 0,
        y: 40,
        rotation: i === 0 ? 1 : i === 1 ? -0.5 : 0.5,
        scale: 0.97,
        ease: 'back.out(1.2)',
        delay: i * 0.08
      });
    });

    // About
    gsap.from('.about-images .img', {
      scrollTrigger: {
        trigger: '.about-images',
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      duration: 0.8,
      opacity: 0,
      scale: 0.9,
      stagger: 0.12,
      ease: 'power2.out'
    });

    gsap.from('.about-content h2', {
      scrollTrigger: {
        trigger: '.about-content',
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      duration: 0.7,
      opacity: 0,
      x: -30,
      ease: 'power2.out'
    });

    gsap.from('.about-content p', {
      scrollTrigger: {
        trigger: '.about-content',
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      duration: 0.8,
      opacity: 0,
      y: 20,
      ease: 'power2.out',
      delay: 0.2
    });

    gsap.from('.about-content .btn-primary', {
      scrollTrigger: {
        trigger: '.about-content',
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      duration: 0.6,
      opacity: 0,
      scale: 0.9,
      ease: 'back.out(1.4)',
      delay: 0.4
    });

    // Passion
    gsap.from('.passion-item.dark .content', {
      scrollTrigger: {
        trigger: '.passion-item.dark',
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      duration: 0.8,
      opacity: 0,
      x: -30,
      ease: 'power2.out'
    });

    gsap.from('.passion-item.white .content', {
      scrollTrigger: {
        trigger: '.passion-item.white',
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      duration: 0.8,
      opacity: 0,
      x: 30,
      ease: 'power2.out'
    });

    // Offer
    gsap.from('.offer-card', {
      scrollTrigger: {
        trigger: '.offer-grid',
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      duration: 0.7,
      opacity: 0,
      y: 30,
      scale: 0.95,
      stagger: 0.1,
      ease: 'back.out(1.2)'
    });

    // Footer
    gsap.from('.footer-inner > *', {
      scrollTrigger: {
        trigger: '.footer',
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      duration: 0.6,
      opacity: 0,
      y: 20,
      stagger: 0.08,
      ease: 'power2.out'
    });
  }

  initPortfolioHover(): void {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('.portfolio-item').forEach((item: any) => {
      item.addEventListener('mouseenter', () => {
        item.querySelector('.image')?.classList.add('hovered');
      });
      item.addEventListener('mouseleave', () => {
        item.querySelector('.image')?.classList.remove('hovered');
      });
    });
  }
}
