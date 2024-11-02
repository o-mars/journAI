import { Injectable } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { RealtimeClient } from '@openai/realtime-api-beta';
import { environment } from 'src/environment';
import { AuthService } from 'src/app/services/auth.service';
import { StoreService } from 'src/app/services/store.service';
import { AudioService } from 'src/app/services/audio.service';

type InputMode = 'push-to-talk' | 'server-vad' | 'text';
type OutputMode = 'text' | 'audio';

@Injectable({
  providedIn: 'root'
})
export class OpenaiRealtimeClientService {
  private _client: RealtimeClient | undefined;

  private _isConnected = false;
  private _inputMode: InputMode = 'server-vad';
  private _outputMode: OutputMode = 'audio';

  constructor(private authService: AuthService, private store: StoreService, private audioService: AudioService) {
    this.init();

    this.authService.isAuthenticated$.subscribe(async isAuth => {
      if (isAuth) {
        await this.connect();
      } else {
        this.disconnect();
      }
    })

    this.store.userPreferences$.subscribe(prefs => {
      // TODO: Maybe stay on VAD, just stop sending audio when not on the mode? might still get charged
      if (this._inputMode !== prefs.inputMode && prefs.inputMode === 'push-to-talk') this.setInputToPTT();
      if (this._inputMode !== prefs.inputMode && prefs.inputMode === 'server-vad') this.setInputToVAD();

      if (this._outputMode !== prefs.outputMode && prefs.outputMode === 'audio') this.setResponsesToAudio();
      if (this._outputMode !== prefs.outputMode && prefs.outputMode === 'text') this.setResponsesToText();
    });

    this.audioService.micStream$.subscribe(micInputArray => {
      console.log('openai realtime api got mic feed');
      this._client && this._isConnected && this._inputMode !== 'text' && this._client.appendInputAudio(micInputArray);
    });
  }

  private init() {
      this._client = new RealtimeClient({
        url: environment.relayServerUrl || '',
      });

      this._client.updateSession({ instructions });
      this._client.updateSession({ voice: 'shimmer' });
      this._client.updateSession({ max_response_output_tokens: 1024 });
  }

  // TODO: Have specific methods for the specific ways you will interact with client instead of directly dealing with client
  get client() {
    return this._client;
  }

  public async sendMessage(message: string) {
    if (this._client && this._isConnected) {
      const result = this._client.sendUserMessageContent([{ type: 'input_text', text: message}]);
      return result;
    }
    return false;;
  }

  public async connect() {
    if (!this._client) return;
    await this._client.connect();
    const modalities = this.getModalities();
    this._client.updateSession({
      instructions,
      modalities,
      voice: 'shimmer',
      max_response_output_tokens: 1024,
      input_audio_transcription: { model: 'whisper-1' },
      turn_detection: this._inputMode === 'server-vad' ? { type: 'server_vad' } : null
    });
    this._isConnected = true;
  }

  public disconnect() {
    if (!this._client) return;
    this._client.disconnect();
    this._isConnected = false;
  }

  public setResponsesToText() {
    this._outputMode = 'text';
    this.updateModalities();
  }

  public setResponsesToAudio() {
    this._outputMode = 'audio';
    this.updateModalities();
  }

  private async updateModalities() {
    if (!this._client) return;
    const wasConnected = this._isConnected;
    if (wasConnected) this.disconnect();
    this._client.updateSession({ modalities: this.getModalities() });
    if (wasConnected) await this.connect();
  }

  public setInputToVAD() {
    this._inputMode = 'server-vad';
    if (!this._client) return;
    this._client.updateSession({ turn_detection: this._inputMode === 'server-vad' ? { type: 'server_vad' } : null });
  }

  public setInputToPTT() {
    this._inputMode = 'push-to-talk';
    if (!this._client) return;
    this._client.updateSession({ turn_detection: null });
  }

  private getModalities() {
    const modalities = ['text'];
    if (this._outputMode === 'audio') modalities.push('audio');
    return modalities;
  }
}

const instructions = `You are a journaling assistant, facilitating journal entries. Aim for a balanced conversation that touches on wellness and productivity, but don't explicitly state these as goals. Respond to the user's input and encourage further reflection. Use subtle, empathetic language to prompt the user to explore their thoughts and feelings. Don't be too verbose and don't paraphrase the users words back to them. Keep a reflective style, but feel free to combine the style with others based on conversation specifics. Your tone should be empathetic, understanding, encouraging and supportive. The conversation should last a couple of minutes, be mindful of that.`