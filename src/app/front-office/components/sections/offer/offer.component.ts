import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../icon/icon.component';

@Component({
  selector: 'app-offer',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.css']
})
export class OfferComponent {
  offers = [
    { icon: 'business', label: 'Corporate' },
    { icon: 'person', label: 'Personal' },
    { icon: 'restaurant', label: 'Culinary' }
  ];
}
