import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[appCheckRoles]',
  standalone: true
})
export class CheckRolesDirective {

  @Input() appCheckRoles:string[]=[]

    @HostBinding('attr.readonly') get type() {
      
      return this.appCheckRoles.includes("ROLE_DEMO")?"":null
    }

}
