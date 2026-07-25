import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

gsap.registerPlugin(ScrollTrigger);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
