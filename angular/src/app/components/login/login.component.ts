import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { HeaderService } from 'src/app/services/header.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private router: Router, private authService: AuthService, private headerService: HeaderService) {
    this.headerService.setRightActionIcon('');
  }

  async handleLogin() {
    const result = await this.authService.loginWithEmailAndPassword(this.email, this.password);
    console.log(result);
  }

  handleSignup() {
    this.router.navigate(['/signup']);
  }
}
