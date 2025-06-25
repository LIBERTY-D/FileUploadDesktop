import { BehaviorSubject} from 'rxjs';
import { ModalType } from '../types/modal.type';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DeleteModalService {
  private behaviorSubject: BehaviorSubject<ModalType> =
    new BehaviorSubject<ModalType>({
      headerText: 'Delete Files?',
      questionText: 'Are you sure you want to permanently delete all Files?',
      show: false,
      toDelete: '',
    });

  readonly behaviourObserver = this.behaviorSubject.asObservable();

  constructor() {}

  updateModalType(modalType: ModalType) {
    this.behaviorSubject.next({ ...modalType });
  }
}
