import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GallerySectionComponent } from '../../components/sections/gallery/gallery-section.component';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, GallerySectionComponent],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent { }
