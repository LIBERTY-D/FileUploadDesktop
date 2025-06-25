import { Component, OnInit } from '@angular/core';
import { SearchbarComponent } from '../../components/searchbar/searchbar.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { AccountTopSectComponent } from '../../components/account-top-sect/account-top-sect.component';
import { Router } from '@angular/router';
import { Clicked, Type } from '../../types/enums.type';
import { UpdateDataService } from '../../services/update-data.service';
import { UpdateTrashDataService } from '../../services/update-trash-data.service';
import { ToastMessageComponent } from '../../components/toast-message/toast-message.component';
import { SuccessErrorMessageService } from '../../services/success-error-message.service';
import { DeleteModalService } from '../../services/delete-modal.service';
import { TokenService } from '../../services/token.service';
import { UserSerice } from '../../services/user.service';
import { User } from '../../types/user.type';
import { CommonModule } from '@angular/common';
import { LoggedInUserService } from '../../services/logged-in-user.service';
import { StatusObjectType } from '../../types/statusobject.type';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    SearchbarComponent,
    SidebarComponent,
    AccountTopSectComponent,
    ToastMessageComponent,
    CommonModule,
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent implements OnInit {
  clickedSiderBarComponent: Clicked = Clicked.HOME;
  user: User | null|undefined = undefined;
  errOrSuccces: StatusObjectType = {
    show: false,
    message: '',
    type: 'error',
  };

  constructor(
    private router: Router,
    private updateDataService: UpdateDataService,
    private updateTrashDataService: UpdateTrashDataService,
    private successErrorMessageService: SuccessErrorMessageService,
    private deleteModalService: DeleteModalService,
    private loggedInUserService: LoggedInUserService
  ) {}
  ngOnInit(): void {
    this.loggedInUserService.user$.subscribe({
      next: (user) => {
        this.user = user;
      },
    });
    this.successErrorMessageService.status$.subscribe({
      next: (value) => {
        this.errOrSuccces = value;
      },
    });
  }

  goToAccountPage = () => {
    this.router.navigate(['/', 'account']);
  };

  onClickSiderBar = (isHome: Clicked) => {
    switch (isHome) {
      case Clicked.HOME:
        this.clickedSiderBarComponent = Clicked.HOME;
        this.updateDataService.init();
        this.deleteModalService.updateModalType({
          headerText: 'Delete Files?',
          questionText:
            'Are you sure you want to permanently delete all Files?',
          show: false,
          toDelete: 'all',
        });

        break;
      case Clicked.TRASH:
        this.clickedSiderBarComponent = Clicked.TRASH;
        this.updateTrashDataService.init();
        this.deleteModalService.updateModalType({
          headerText: 'Delete Files in Trash?',
          questionText:
            'Are You Sure You Want To Permanently Delete Files In Trash',
          show: false,
          toDelete: 'trash',
        });

        break;

      default:
        break;
    }
  };

  goToAuthPage() {
    this.router.navigate(['/', 'auth']);
  }
}
