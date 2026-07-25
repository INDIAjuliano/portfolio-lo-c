import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../icon/icon.component';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent {
  portfolioItems = [
    {
      id: 1,
      image: 'assets/images/home/home-rooms-main.jpg',
      label: 'Wedding'
    },
    {
      id: 2,
      image: 'assets/images/home/home-rooms-1.jpg',
      label: 'Corporate'
    },
    {
      id: 3,
      image: 'assets/images/home/home-portrait.jpg',
      label: 'Portrait'
    },
    {
      id: 4,
      image: 'assets/images/home/home-events.jpg',
      label: 'Events'
    },
    {
      id: 5,
      image: 'assets/images/home/home-fashion.jpg',
      label: 'Fashion'
    }
  ];
}
