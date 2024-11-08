import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { encodeWAV, encodeWAVChunk } from 'src/app/lib/wav.encoder';
import { ConversationItem } from 'src/app/models/conversation';
import { AudioService } from 'src/app/services/audio.service';
import { HeaderService } from 'src/app/services/header.service';
import { OpenaiRealtimeClientService } from 'src/app/services/openai-realtime-client.service';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-new-entry',
  templateUrl: './new-entry.component.html',
  styleUrls: ['./new-entry.component.scss']
})
export class NewEntryComponent implements OnInit, OnDestroy {
  isPushToTalkMode = false;
  isRecording = false;
  inputText = '';

  audioContext!: AudioContext;
  audioQueue: Int16Array[] = [];
  audioId = '';
  isPlaying = false;

  audioInput: Int16Array | undefined = undefined;
  audioOutput: Int16Array | undefined = undefined;

  conversationItems: ConversationItem[] = [
    { id: '1', formatted: { transcript: 'hello transcript??', text: 'hello text!!' }, role: 'user'},
    { id: '2', formatted: { transcript: 'bye transcript??', text: 'bye text!!' }, role: 'assistant'},
    { id: '3', formatted: { transcript: 'hello transcript??', text: 'hello text!!' }, role: 'user'},
  ];

  constructor(
    private audioService: AudioService,
    private realtimeService: OpenaiRealtimeClientService,
    private router: Router,
    private headerService: HeaderService,
    private store: StoreService
  ) {

  }

  ngOnInit() {
    this.audioContext = new AudioContext({ sampleRate: 24000 });

    this.headerService.setRightActionIcon('check.svg');
    this.headerService.actionClicked$.subscribe(() => this.complete());

    this.realtimeService.conversationItems$.subscribe(convoItems => {
      this.conversationItems = convoItems;
    });

    this.realtimeService.audioCompletedItem$.subscribe(async ({id, audio}) => {
      if (!!id && !!audio) {
        const index = this.conversationItems.findIndex(item => item.id === id);
        const url = URL.createObjectURL(audio);
        this.conversationItems[index].formatted.file = { url };
        console.log(audio, url, this.conversationItems);
      }
    });
    this.realtimeService.audioDeltaItem$.subscribe(({id, audio}) => {
      if (!!id && !!audio) this.queueAudio(id, audio);
      // if (!!audioStream) this.playAudioChunk(audioStream.audio);
    });

    // This code is to test speaker using mic stream instead of openAI audio to save $
    this.audioService.micStream$.subscribe((micStream: Int16Array) => {
      if (this.isRecording) {
        this.audioInput = micStream;
        this.queueAudio('test', micStream);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.audioContext) {
      this.audioContext.close();
    }
  }

  sendTextMessage() {
    console.log('send text message: ', this.inputText);
    this.realtimeService.sendMessage(this.inputText);
    this.inputText = '';
  }

  async complete() {
    const summary = await this.realtimeService.analyzeEntry([]);
    this.store.saveEntry(this.conversationItems);
    this.inputText = '';
    this.conversationItems = [];
    this.realtimeService.disconnect();
    this.router.navigate(['/main']);
  }

  private queueAudio(id: string, stream: Int16Array) {
    if (this.audioId !== id) {
      this.audioQueue = [];
      this.audioId = id;
      this.isPlaying = false;
    }
    this.audioQueue.push(stream);
    if (!this.isPlaying) {
      this.playNextChunk();
    }
  }

   playNextChunk(): void {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      return; // No more audio to play
    }

    this.isPlaying = true;
    const audioData = this.audioQueue.shift(); // Get the next audio chunk
    this.audioOutput = audioData;

    if (audioData && audioData.length > 0) {
      // Convert Int16Array to Float32Array for AudioBuffer compatibility
      const float32Data = new Float32Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        float32Data[i] = audioData[i] / 32768;
      }

      const audioBuffer = this.audioContext.createBuffer(1, float32Data.length, 24000);
      audioBuffer.copyToChannel(float32Data, 0);

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      // When this chunk ends, play the next chunk
      source.onended = () => {
        this.playNextChunk();
      };
      
      source.start();
    }
  }

  handleDeleteItem(id: string): void {
    this.conversationItems = this.conversationItems.filter(item => item.id !== id);
  }

  handleMouseDownOrTouchStart() {
    this.isRecording = true;
    this.audioService.startRecording();
    // Add further logic for handling recording
  }

  handleMouseUpOrTouchEnd() {
    this.isRecording = false;
    this.audioService.stopRecording();
    // Add further logic for stopping recording
  }

  handleRecord() {
    this.isRecording = !this.isRecording;
    if (this.isRecording) this.audioService.startRecording();
    else this.audioService.stopRecording();
  }
}
