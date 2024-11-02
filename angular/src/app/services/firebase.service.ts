import { Injectable } from '@angular/core';
import { FirebaseApp, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { Analytics, getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDQZ6uBHhhqgXR-nUJ2upLqEqsGx7dLt8Q",
  authDomain: "note-taking-app-d0eca.firebaseapp.com",
  projectId: "note-taking-app-d0eca",
  storageBucket: "note-taking-app-d0eca.appspot.com",
  messagingSenderId: "1015595119708",
  appId: "1:1015595119708:web:574e7f707059e944636299",
  measurementId: "G-QNPHTQQ0R9"
};

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  app: FirebaseApp = initializeApp(firebaseConfig);
  analytics: Analytics = getAnalytics(this.app);
  auth: Auth = getAuth(this.app);
  db: Firestore = getFirestore(this.app);
  // private app: FirebaseApp;
  // private _analytics: Analytics;
  // private _auth: Auth;
  // private _db: Firestore;

  // constructor() { 
  //   this.app = initializeApp(firebaseConfig);
  //   this._analytics = getAnalytics(this.app);
  //   this._auth = getAuth(this.app);
  //   this._db = getFirestore(this.app);
  // }

  // get analytics() {
  //   return this._analytics;
  // }

  // get auth() {
  //   return this._auth;
  // }

  // get db() {
  //   return this._db;
  // }
}
