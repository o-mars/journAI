import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;

  private micStream = new BehaviorSubject<Int16Array>(Int16Array.from([]));
  public micStream$ = this.micStream.asObservable();

  async initAudio() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext({ sampleRate: 24000 });
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaStreamSource = this.audioContext.createMediaStreamSource(this.mediaStream);

      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      this.mediaStreamSource.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

      this.processor.onaudioprocess = (event) => this.processAudio(event);
    }
  }

  private processAudio(event: AudioProcessingEvent) {
    const audioData = event.inputBuffer.getChannelData(0);
    const int16Array = new Int16Array(audioData.length);

    for (let i = 0; i < audioData.length; i++) {
      int16Array[i] = Math.max(-1, Math.min(1, audioData[i])) * 0x7FFF; // Convert to 16-bit PCM
    }

    this.micStream.next(int16Array);
  }

  async startRecording() {
    await this.initAudio();
    console.log('Recording started');
  }

  async stopRecording() {
    if (this.processor) {
      this.processor.disconnect();
      this.mediaStreamSource?.disconnect();
      this.audioContext?.close();
      this.mediaStream = null;
      this.mediaStreamSource = null;
      this.processor = null;
      this.audioContext = null;

      console.log('Recording stopped');
    }
  }

  async cleanupAudio() {
    this.stopRecording();
  }
}
