import { Component, Input, OnInit } from '@angular/core';
import { User } from '../../types/user.type';
import { LoggedInUserService } from '../../services/logged-in-user.service';

@Component({
  selector: 'app-account-top-sect',
  standalone: true,
  imports: [],
  templateUrl: './account-top-sect.component.html',
  styleUrl: './account-top-sect.component.css',
})
export class AccountTopSectComponent implements OnInit {
  @Input() goToAccountPage!: () => void;
  user: User | null= null;

  constructor(private loggedInUserService: LoggedInUserService) {}
  ngOnInit(): void {
    this.loggedInUserService.user$.subscribe({
      next: (user) => {
        this.user = user;
      },
    });
  }

  createUrl(imageSrc: Blob) {
    return URL.createObjectURL(imageSrc);
  }
}
