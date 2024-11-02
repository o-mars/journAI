import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { HeaderService } from 'src/app/services/header.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  isAuthenticated = false;

  constructor(private authService: AuthService, private router: Router, private headerService: HeaderService) {
    this.authService.isAuthenticated$.subscribe(isAuth => this.isAuthenticated = isAuth)
    this.headerService.setTitle('Menu');
    this.headerService.setRightActionIcon('check.svg');
  }

  async handleLogout() {
    const result = await this.authService.logout();
  }

  handleSettings() {
    this.router.navigate(['/settings']);
  }

  handleFoo() {
    this.router.navigate(['/dashboard']);
  }

}
