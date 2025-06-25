import { Component } from '@angular/core';
import { AuthComponent } from '../../components/auth/auth.component';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [AuthComponent],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css'
})
export class AuthPageComponent {

}
