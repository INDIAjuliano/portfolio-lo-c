import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../icon/icon.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  aboutImages = [
    'assets/images/home/home-about-1.jpg',
    'assets/images/home/home-about-2.jpg',
    'assets/images/home/home-about-3.jpg',
    'assets/images/home/home-about-4.jpg'
  ];
}
