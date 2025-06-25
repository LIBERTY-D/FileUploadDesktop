import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class GetenvService {
  constructor() {}

  getFileBaseUrl() {
    return environment.fileBaseUrl;
  }

  getUserBaseUrl() {
    return environment.userBaseUrl;
  }
  getKeyForToken() {
    return environment.TOKEN_KEY;
  }
}
