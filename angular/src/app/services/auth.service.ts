import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authState = new BehaviorSubject<User | null>(null);

  constructor(private firebaseService: FirebaseService, private router: Router) {
    onAuthStateChanged(this.firebaseService.auth, (user) => {
      this.authState.next(user);
      console.log('auth service doing route change');
      this.router.navigate([!!user ? '/main' : '/login']);
    });
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.authState.asObservable().pipe(map(user => !!user));
  }

  get currentUser(): User | null {
    return this.authState.value;
  }

  public async loginWithEmailAndPassword(email: string, password: string) {
    const result = await signInWithEmailAndPassword(this.firebaseService.auth, email, password);
    return result;
  }

  public async createUserWithEmailAndPassword(email: string, password: string) {
    const result = await createUserWithEmailAndPassword(this.firebaseService.auth, email, password);
    return result;
  }

  public async logout() {
    await this.firebaseService.auth.signOut();
  }
}
