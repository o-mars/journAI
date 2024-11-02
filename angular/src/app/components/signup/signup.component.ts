import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  error: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  async handleSignup() {
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
    } else {
      this.error = '';
      console.log('Sign up with:', this.email, this.password);
      await this.authService.createUserWithEmailAndPassword(this.email, this.password);
    }
  }

  handleLogin() {
    this.router.navigate(['/login']);
  }
}
