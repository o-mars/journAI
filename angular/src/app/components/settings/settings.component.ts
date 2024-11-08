import { Component } from '@angular/core';
import { UserPreferences } from 'src/app/models/user.preferences';
import { StoreService } from 'src/app/services/store.service';
import { OpenaiRealtimeClientService } from 'src/app/services/openai-realtime-client.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  userPreferences = new UserPreferences();

  constructor(private store: StoreService, private realtimeClient: OpenaiRealtimeClientService, private router: Router) {
    this.store.userPreferences$.subscribe(userPrefs => this.userPreferences = userPrefs);
  }

  togglePTT() {
    this.userPreferences.inputMode = this.userPreferences.inputMode === 'server-vad' ? 'push-to-talk' : 'server-vad';
    this.store.saveUserPreferences(this.userPreferences);
    if (this.userPreferences.inputMode === 'push-to-talk') {
      this.realtimeClient.setInputToPTT();
    } else {
      this.realtimeClient.setInputToVAD();
    }
  }

  toggleTextOnlyOutput() {
    this.userPreferences.outputMode = this.userPreferences.outputMode === 'audio' ? 'text' : 'audio';
    this.store.saveUserPreferences(this.userPreferences);
    if (this.userPreferences.outputMode === 'audio') {
      this.realtimeClient.setResponsesToAudio();
    } else {
      this.realtimeClient.setResponsesToText();
    }
  }

  toggleAutostart() {
    this.userPreferences.shouldAutostart = !this.userPreferences.shouldAutostart;
    this.store.saveUserPreferences(this.userPreferences);
  }

  toggleSaveChats() {
    this.userPreferences.shouldSaveChats = !this.userPreferences.shouldSaveChats;
    this.store.saveUserPreferences(this.userPreferences);
  }

  routeToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
