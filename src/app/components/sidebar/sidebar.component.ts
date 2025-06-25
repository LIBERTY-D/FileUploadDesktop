import { Component, Input, OnInit } from '@angular/core';
import { UploadDowloadService } from '../../services/upload-dowload.service';
import { Clicked } from '../../types/enums.type';
import { UserSerice } from '../../services/user.service';
import { LoggedInUserService } from '../../services/logged-in-user.service';
import { User } from '../../types/user.type';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  @Input() onClickSiderBar!: (isHome: Clicked) => void;

  user:User|null=null
  uploadDowloadService: UploadDowloadService;
  constructor(
    uploadDowloadService: UploadDowloadService,
    private loggedInUserService: LoggedInUserService,
  
  ) {
    this.uploadDowloadService = uploadDowloadService;
  }
  ngOnInit(): void {
      this.loggedInUserService.user$.subscribe({
      next: (user) => {
        this.user = user;
      },
    });
  }

  onUploadFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.uploadDowloadService.onUploadFiles(Array.from(input.files));
    }
  }
  onClickSiderBarImpl = (value: number) => {
    switch (value) {
      case Clicked.HOME:
        this.onClickSiderBar(Clicked.HOME);
        break;
      case Clicked.TRASH:
        this.onClickSiderBar(Clicked.TRASH);

        break;
      default:
      
        break;
    }
  };

  logout() {
    this.loggedInUserService.clearUser();
  }
}
