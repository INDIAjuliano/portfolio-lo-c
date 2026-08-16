import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../../core/services/menu.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-mobile-menu',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './mobile-menu.component.html',
  styleUrls: ['./mobile-menu.component.css']
})
export class MobileMenuComponent {
  constructor(public menuService: MenuService) {}

  close(): void {
    this.menuService.close();
  }
}
