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
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtwh-yTiMGrGHQFWwYI9yXYGIXolAUSnpn_o7ZqdM9grAZCE72GTAv8_uHNEOr02y8Pn_55umWCB_yrsRa0OO2pqyRtWvtQDomDCTmKtauld3AJOMgn9GhgVexyLDQGyAFMomwF5Dx6RL7hAO-um0QEPKfmArTcLbqhP1M9h1t9x-Dok0R1BmFJvtyo5b1pzgKJT62M2J3I7QZq964-SSglgYRCYebWxkEXD_BUAnS_mwlgcIYTQdu',
      label: 'Cinematic'
    },
    {
      id: 2,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4GWnoboXR08tQX5eZ-lDFIlK0_Cq9CBYVKYSRbtu6z7U4XJTXAruAilRjyQwLdXHuefgOQ5TyTeZNHG9u4fLG2k2C9He9MQaWiKsvWoya1_2NR5MIOnaw3QHXo7_xm_82KhTZmybmdt35eKQo2VMLh6uBU-rNhTq-gor15vHSqXPAGa76btWtyZTp6K7iTj76cvWzlDLzTfL4Y5NcU1XTqf1Ou9EwN7FBoUdfauB8l6Jg5rElpZP-',
      label: 'Culinary'
    },
    {
      id: 3,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzdR-cEKxuAmS0_ioeHhSSAnFG6nTpGNmmmmSBPcAhNRa4Wu08p-T2HAhXjtYV0dRzRChjqa6PF_lvfilCLhuQR-j3VPL2r8zikb7pGlUBzNKXYI8YqhajEYI6NQ2sTEmquXyeOknmoZu3ZKMFAHMnHH3MV6gg7-xO5_bDOnEwGh7zokP3qNrRX3S7xWmGCpPrY4hxiAGwg635hLR34QOQb9qD698c5-qfVOGA_AAuKDV9uNWKXjQK',
      label: 'Portrait'
    },
    {
      id: 4,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4Pqzv-htMPtL7l9C-wKhr4h8r_AkhPUpS4ywa3it7ZlpjyLQ9_-Jt1rqxaPWhgB27Cajy5ZQD5US9Wxs4_cbYDLZbHKq8xUmohvvgjCvFnVMpKfbTCJt0IF8nfqyuK8Jf0yzhp6mMA8XDd-R1_ZPnAbcPu1gPxIkwQTrtyW0JZGtWDec1LIHjuGdYvk2KLuz22qSlbmieYlK8_k9pIMKg_RJq8koEAdO4Qthnw5TFUpq7YHVISCsq',
      label: 'Real Estate'
    },
    {
      id: 5,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwulFxrZGdc2Orx-UeIsXv52J_UUyLGrKexHf9GIhd2kAgijoILC7nDGDx96c4y2GWs6kJzRaNYMFRLo6L7QeP5GwDwcsrwPLBUfT478-jwfwKNuwdIi1lCSQvCQv6t4zwhP7bM0jjyq_VcUIhEt_3XNzF0lIDEcVWgr39hWdI946-W8tXfGY8ON0H7WcQQYpgabSK0mCyuoBUChaTR7c9jQGhL-r652YtNh6OQ6C5JF5wSLPy38FE',
      label: 'Corporate'
    }
  ];
}
