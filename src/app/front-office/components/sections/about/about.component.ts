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
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBCsgc8Vp5j9lAtQ4SsVqS8nTc5qHnjBCMR_gcVqMMs_TuL13cRyKIXc3Jd_AjwC-aEuzDiae6MrCa4jI-D5nk1SWvHB5PTMV2tbeHSNWWH41NVHM1FjNvgrmiy9lLrxBxoYplZV9QE0mkLyWNWDgjJjTbgIDy7xigKt2m4ZZFpWsPcdIGS8B07i9WrEYaxP_DJn0HR2rN33J2N9vcEHZ0KnVnPRZPMoYXsZj6Izrci4fZtVEJnC8I-',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAQAkPQkboLWPzOygMgGuFIDC29-x5HxOGvf24libeyDGFuFlyM98IBZ94gpCZoWGpVjqn7B_1PhBpgYQ94NRrPNQT2YsG7f-CUlyg8IFzaTQS9_hH8rbVHl7uGg0SexZadhbnFu5Et2cV9_voNJTCakbGzi4UL-tKw2R4rH4K0Rx3xTy7pC-cGhpN0ARkQWA0l3G3hlBWZPkRbZA5deXMO-cIXds7pMwrrBzx6RQyKdJOgAmm8VtKq',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCxBRNtOrTXmULlsudSbJXa_jGCbh8y86zJSMntwwNfshcsaMmIUQ_f-P9dg-3pDrTqpQ37ErL_Fk9-WH4fcr3ZSUwrnAcxVNa8_QUS7m1NacQiUUNGZTlz0GURDBOVPYl9B7soZVC3xjKWOVJlaW6MZbwFZhXHwCwSTISsdIdQy3eztkLrgtAtg-VYuQw9cIRjTANDyUc2JiPz85G2hkFRI30LetZvUCUFWaqhRsnnymF0FoIwEhEd',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBe06fAP7sXNKEyhOowqXeJSfTnBlz1SGJBLpE6mHcFta1cq1jb-47fWkcPOsH2lwfYCWBjOVALl_XadJ34Ln41ZYoQf3DSUOaB7Ib4Tj8uWW_zwRFjQtEEf6Hh0WE_12uSV-pThOn6J1BJqhD1bY2kWxoBWHwJTEf6D-Z9u4ucs4X7_bFwGpHh5k-In82ByhNDXWM078w63uouBuQ3J1QFRc7189z3Os_odS67tV06HgZwcRnidSRB'
  ];
}
