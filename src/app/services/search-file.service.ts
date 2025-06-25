import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchFileService {
  private behaviorSubject: BehaviorSubject<string> =
  new BehaviorSubject<string>('');
  readonly subjectOnserver = this.behaviorSubject.asObservable();

  constructor() {}

  updateSearchText(searchText: string) {
  
    this.behaviorSubject.next(searchText);
  }
}
