import { Directive, Output, EventEmitter, OnChanges, SimpleChanges, AfterViewInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appScrollInfinite]',
  standalone: true
})
export class ScrollInfiniteDirective implements OnChanges, AfterViewInit, OnDestroy {
  @Output() scrollReached = new EventEmitter<void>();

  private observer: IntersectionObserver | null = null;
  private scrollThreshold = 200;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appScrollInfinite'] && !changes['appScrollInfinite'].firstChange) {
      this.setupObserver();
    }
  }

  ngAfterViewInit(): void {
    this.setupObserver();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupObserver(): void {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.scrollReached.emit();
          }
        });
      },
      {
        rootMargin: `${this.scrollThreshold}px`
      }
    );

    const element = document.querySelector('[data-scroll-infinite-trigger]') as HTMLElement | null;
    if (element) {
      this.observer.observe(element);
    }
  }
}
