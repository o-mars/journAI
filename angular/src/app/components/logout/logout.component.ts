import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent {
  isAuthenticated = false;

  constructor(private authService: AuthService) {
    this.authService.isAuthenticated$.subscribe(isAuth => this.isAuthenticated = isAuth)
  }

  async handleLogout() {
    const result = await this.authService.logout();
  }
}
