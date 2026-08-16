import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private dismissSubject = new Subject<void>();
  dismiss$ = this.dismissSubject.asObservable();

  requestDismiss(): void {
    this.dismissSubject.next();
  }
}
