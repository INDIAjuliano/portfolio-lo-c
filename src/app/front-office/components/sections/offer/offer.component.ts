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
    { icon: 'photo_camera', label: 'Wedding' },
    { icon: 'portrait', label: 'Portrait' },
    { icon: 'event', label: 'Corporate' },
    { icon: 'travel_explore', label: 'Lifestyle' },
    { icon: 'movie', label: 'Fashion' }
  ];
}
