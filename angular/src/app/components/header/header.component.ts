import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderService } from 'src/app/services/header.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  title = 'JournAI';
  icon: string | null = ''; // todo; default icon none?
  isShowingMenu = false;
  previousRoute = '';
  constructor(private headerService: HeaderService, private router: Router) {
    this.headerService.title$.subscribe(title => this.title = title);
    this.headerService.rightActionIcon$.subscribe(icon => this.icon = icon);
    this.headerService.actionClicked$.subscribe(() => {
      switch(this.router.url) {
        case '/menu':
          this.toggleMenu();
          this.router.navigate(['/dashboard']);
          break;
        case '/settings':
          this.router.navigate(['/menu']);
          break;
        case '/new-entry':
          this.router.navigate(['/dashboard']);
          break;
        default:
          break;
      }
      console.log(this.router.url);
    })
  }

  toggleMenu() {
    console.log('handle show menu');
    if (this.isShowingMenu) {
      this.router.navigate([this.previousRoute]);
      this.previousRoute = '';
    } else {
      this.previousRoute = this.router.url;
      this.router.navigate(['/menu']);
    }
    this.isShowingMenu = !this.isShowingMenu;
  }

  triggerAction() {
    console.log('action trigger');
    this.headerService.triggerAction();
  }

}
