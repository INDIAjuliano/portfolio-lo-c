import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// Sections
import { HeroComponent } from '../../components/sections/hero/hero.component';
import { RoomsComponent } from '../../components/sections/rooms/rooms.component';
import { PortfolioComponent } from '../../components/sections/portfolio/portfolio.component';
import { AboutComponent } from '../../components/sections/about/about.component';
import { PassionComponent } from '../../components/sections/passion/passion.component';
import { OfferComponent } from '../../components/sections/offer/offer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroComponent,
    RoomsComponent,
    PortfolioComponent,
    AboutComponent,
    PassionComponent,
    OfferComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent { }
