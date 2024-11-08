import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  isAuthenticated = false;

  constructor(private authService: AuthService, private router: Router) {
    this.authService.isAuthenticated$.subscribe(isAuth => this.isAuthenticated = isAuth)
  }

  async handleLogout() {
    const result = await this.authService.logout();
  }

  handleSettings() {
    this.router.navigate(['/settings']);
  }

  backToDashboard() {
    this.router.navigate(['/dashboard']);
  }

}
