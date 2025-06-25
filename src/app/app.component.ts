import { Component } from '@angular/core';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { AuthComponent } from './components/auth/auth.component';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'uploader-app';
}
