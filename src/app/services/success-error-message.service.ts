import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StatusObjectType } from '../types/statusobject.type';

@Injectable({
  providedIn: 'root',
})
export class SuccessErrorMessageService {
  private behaviorSubject = new BehaviorSubject<StatusObjectType>({
    message: '',
    show: false,
    type: 'none',
  });

  readonly status$ = this.behaviorSubject.asObservable();

  constructor() {}

  updateMessage(status: StatusObjectType, duration = 5000): void {
    this.behaviorSubject.next({ ...status });

    if (duration > 0) {
      setTimeout(() => this.clearMessage(), duration);
    }
  }

  clearMessage(): void {
    this.behaviorSubject.next({ message: '', show: false, type: 'none' });
  }
}
