import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

// Sections
import { HeroComponent } from '../../components/sections/hero/hero.component';
import { Hero2Component } from '../../components/sections/hero2/hero2.component';
import { RoomsComponent } from '../../components/sections/rooms/rooms.component';
import { PortfolioComponent } from '../../components/sections/portfolio/portfolio.component';
import { AboutComponent } from '../../components/sections/about/about.component';
import { PassionComponent } from '../../components/sections/passion/passion.component';
import { OfferComponent } from '../../components/sections/offer/offer.component';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroComponent,
    Hero2Component,
    RoomsComponent,
    PortfolioComponent,
    AboutComponent,
    PassionComponent,
    OfferComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  host: {
    'ngSkipHydration': 'true'
  }
})
export class HomeComponent implements OnInit, OnDestroy {
  showHero: boolean = false;
  showHero2: boolean = false;
  private sub = new Subscription();

  constructor(private themeService: ThemeService) {
    const variant = this.themeService.getCurrentHeroVariant();
    this.showHero = variant === 'hero1';
    this.showHero2 = variant === 'hero2';
    console.log('constructor showHero:', this.showHero, '| showHero2:', this.showHero2);
  }

  ngOnInit(): void {
    console.log('ngOnInit showHero:', this.showHero, '| showHero2:', this.showHero2);

    this.sub.add(
      this.themeService.heroVariant$.subscribe(v => {
        this.showHero = v === 'hero1';
        this.showHero2 = v === 'hero2';
        console.log('subscribe showHero:', this.showHero, '| showHero2:', this.showHero2);
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
