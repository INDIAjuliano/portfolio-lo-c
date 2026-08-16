import { Component, Input, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import iconSet from '@iconify-json/mdi/icons.json';
import iconSetIc from '@iconify-json/ic/icons.json';

const ALIAS: Record<string, string> = {
  arrow_right_alt: 'arrow-right',
  photo_camera: 'camera',
  movie: 'movie',
  alternate_email: 'email',
  face_nod: 'head',
  light_mode: 'white-balance-sunny',
  dark_mode: 'weather-night',
  admin_panel_settings: 'account-settings',
  photo_library: 'image',
  mail: 'email',
  business: 'briefcase',
  person: 'account',
  restaurant: 'silverware-fork-knife',
  chevron_left: 'chevron-left',
  expand_more: 'chevron-down',
  account_circle: 'account-circle',
  settings: 'cog',
  help: 'help',
  logout: 'logout',
  edit: 'pencil',
  delete: 'delete',
  add: 'plus',
  search: 'magnify',
  calendar_today: 'calendar',
  category: 'shape'
};

@Component({
  selector: 'app-icon',
  template: `
    <svg
      [attr.viewBox]="viewBox"
      xmlns="http://www.w3.org/2000/svg"
      [class]="'app-icon ' + cls"
      [style.width.px]="sizeNumber"
      [style.height.px]="sizeNumber"
      [style.color]="color"
    >
      @for (d of pathData; track $index) {
        <path [attr.d]="d" fill="currentColor" />
      }
    </svg>
  `,
  styles: [`
    .app-icon {
      display: inline-flex;
      flex-shrink: 0;
      line-height: 0;
      vertical-align: middle;
    }
  `],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  @Input() name!: string;
  @Input() size: string | number = 24;
  @Input() color: string = 'currentColor';
  @Input() class: string = '';
  @Input() viewBox: string = '0 0 24 24';
  @Input() collection: 'mdi' | 'ic' = 'mdi';

  get cls(): string {
    return this.class ? `app-icon ${this.class}` : 'app-icon';
  }

  get sizeNumber(): number {
    return typeof this.size === 'number' ? this.size : parseInt(this.size, 10) || 24;
  }

  private resolvedName(): string {
    const base = ALIAS[this.name] ?? this.name;
    if (this.collection === 'ic') {
      return `baseline-${base}`;
    }
    return base;
  }

  get pathData(): string[] {
    const set = this.collection === 'ic' ? (iconSetIc as any) : (iconSet as any);
    const icons = set.icons;
    let icon = icons && icons[this.resolvedName()];
    if (!icon?.body && this.collection === 'ic') {
      icon = icons && icons[`outline-${this.name}`];
    }
    if (!icon?.body) return [];
    const result: string[] = [];
    const regex = /d="([^"]*)"/g;
    let match;
    while ((match = regex.exec(icon.body)) !== null) {
      result.push(match[1]);
    }
    return result;
  }
}
