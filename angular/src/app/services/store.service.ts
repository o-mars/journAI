// firestore.service.ts
import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';
import { ConversationItem } from 'src/app/models/conversation';
import { UserPreferences } from 'src/app/models/user.preferences';
import { AuthService } from 'src/app/services/auth.service';
import { FirebaseService } from 'src/app/services/firebase.service';


@Injectable({
  providedIn: 'root'
})
export class StoreService {
  constructor(private firebaseService: FirebaseService, private authService: AuthService) {
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.fetchUserPreferences();
      } else {
        // this.userPreferences.next(new UserPreferences());
      }
    });
  }

  private userPreferences = new BehaviorSubject<UserPreferences>(new UserPreferences());
  public userPreferences$ = this.userPreferences.asObservable();

  public async fetchUserPreferences() {
    if (this.authService.currentUser === null) return console.error('Error saving preferences: User not logged in');

    try {
      const userId = this.authService.currentUser?.uid;
      const userDocRef = doc(this.firebaseService.db, `users/${userId}`);
      const userDoc = await getDoc(userDocRef);
    
      if (userDoc.exists()) {
        const preferences = userDoc.data()['preferences'];
        const newUserPreferences = new UserPreferences();
        if (preferences['inputMode']) newUserPreferences.inputMode = preferences['inputMode'];
        if (preferences['outputMode']) newUserPreferences.outputMode = preferences['outputMode'];
        if (preferences['shouldAutostart']) newUserPreferences.shouldAutostart = preferences['shouldAutostart'];
        if (preferences['lastUpdated']) newUserPreferences.lastUpdated = preferences['lastUpdated'];
        this.userPreferences.next(newUserPreferences);
        console.log('preferences loaded:', preferences);
      } else {
        // No preferences found, create defaults?
        console.log('No preferences found');
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  }

  public async saveUserPreferences(userPreferences: UserPreferences = this.userPreferences.value) {
    if (this.authService.currentUser === null) return console.error('Error saving preferences: User not logged in');
    try {
      const userId = this.authService.currentUser?.uid;
      await setDoc(doc(this.firebaseService.db, `users/${userId}`), {
        preferences: {
          inputMode: userPreferences.inputMode,
          outputMode: userPreferences.outputMode,
          shouldAutoStart: userPreferences.shouldAutostart,
          lastUpdated: serverTimestamp(),
        }
      }, { merge: true });
  
      console.log("Preferences saved.");
    } catch (e) {
      console.error("Error saving preferences: ", e);
    }
  };

  public async saveEntry(conversation: ConversationItem[]) {
    /*
    */
  }

  public async updateEntry() {

  }
}

