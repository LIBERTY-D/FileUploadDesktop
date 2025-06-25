import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[appTogglePassword]',
  standalone: true
})


export class TogglePasswordDirective {
  @Input() appTogglePassword: boolean = false;

  @HostBinding('attr.type') get type() {
    return this.appTogglePassword? 'text' : 'password';
  }
}

