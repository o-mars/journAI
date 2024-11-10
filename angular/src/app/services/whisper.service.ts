import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { AudioService } from 'src/app/services/audio.service';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environment';

@Injectable({
  providedIn: 'root'
})
export class WhisperService {
  private whisperSocket?: WebSocket;

  public audioTranscription$ = new Subject<string>();

  public stt$ = new Subject<string>();
  public textPipe$ = new Subject<any>();
  public tts$ = new Subject<any>();

  constructor(
    private audioService: AudioService
  ) {
    this.whisperSocket = new WebSocket(`${environment.relayServerUrl}`);

    this.whisperSocket.onopen = () => console.log('Connected to Relay Server');
    this.whisperSocket.onmessage = (event) => {
      if (typeof event.data === 'string') {
        const json = JSON.parse(event.data);
        if (json['type'] === 'stt') {
          this.stt$.next(json['data']);
        }
        this.textPipe$.next(json);
        console.log(json);
      } else if (event.data instanceof Blob) {
        this.tts$.next(event.data);
      } else {
        console.error('got unknown message from relay server: ', event);
      }
      // this.audioTranscription$.next(event.data);
    };

    this.audioService.micStream$.subscribe(micInputArray => {
      if (micInputArray.length > 0) this.sendAudio(micInputArray);
    });
  }

  public async sendText(text: string) {
    if (this.whisperSocket && this.whisperSocket?.readyState === WebSocket.OPEN) {
      this.whisperSocket.send(text);
    } else {
      console.error('WebSocket is not open');
    }
  }

  public async sendAudio(audioData: Int16Array) {
    if (this.whisperSocket && this.whisperSocket?.readyState === WebSocket.OPEN) {
      // console.log('sending audio to deepgram: ', audioData);
      this.whisperSocket.send(audioData);
    } else {
      console.error('WebSocket is not open');
    }
  }

  public cleanup() {
    if (this.whisperSocket && this.whisperSocket.readyState === WebSocket.OPEN) {
      this.whisperSocket.close();
    }
  }
}
