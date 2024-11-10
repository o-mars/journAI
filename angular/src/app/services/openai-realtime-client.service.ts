import { Injectable } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { RealtimeClient } from '@openai/realtime-api-beta';
import { environment } from 'src/environment';
import { AuthService } from 'src/app/services/auth.service';
import { StoreService } from 'src/app/services/store.service';
import { AudioService } from 'src/app/services/audio.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { encodeWAV } from 'src/app/lib/wav.encoder';
import { ConversationItem } from 'src/app/models/conversation';
import { ChatCompletionMessage } from 'openai/resources';

type InputMode = 'push-to-talk' | 'server-vad' | 'text';
type OutputMode = 'text' | 'audio';

@Injectable({
  providedIn: 'root'
})
export class OpenaiRealtimeClientService {
  private _realtimeClient: RealtimeClient | undefined;

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
      // console.log('openai realtime api got mic feed');
      // this._client && this._isConnected && this._inputMode !== 'text' && this._client.appendInputAudio(micInputArray);
    });
  }

  public async analyzeEntry(conversation: ConversationItem[]) {

    // const response = await fetch(`http://${environment.serverUrl}/proxy/openai`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     messages: [
    //       { role: "system", content: "You are a helpful assistant." },
    //       { role: "user", content: "Can you please say Fee Fi Fo Fum?" }
    //     ]
    //   })
    // });

    // const json = await response.json();
    // console.log(json);

    // const tts = await fetch(`http://${environment.serverUrl}/tts`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: "The quick brown foxes. Please say Fee Fi Fo Fum?",
    // });

    // const x = await tts.json();
    // console.log(x);

    // if (!this._client) return console.error('open ai client not set up');

    // const stringifiedConversation = conversation.map(c => `${c.role}: ${c.formatted.text}`).join('');

    // const response = await this._client.chat.completions.create({
    //   model: "gpt-4o-mini",
    //   messages: [
    //       { role: "system", content: instructionsForAnalysis },
    //       { role: "user", content: stringifiedConversation },
    //   ],
    // })

    // const message: ChatCompletionMessage = response.choices[0].message;
    // console.log(message.content);

    // return message ?? response.choices[0].message.refusal;
  }

  private init() {
      // this._realtimeClient = new RealtimeClient({
      //   url: environment.relayServerUrl + '/openai' || '',
      // });

      // this._realtimeClient.updateSession({ instructions });
      // this._realtimeClient.updateSession({ voice: 'shimmer' });
      // this._realtimeClient.updateSession({ max_response_output_tokens: 1024 });
  }

  // TODO: Have specific methods for the specific ways you will interact with client instead of directly dealing with client.
  get client() {
    return this._realtimeClient;
  }

  public async sendMessage(message: string) {
    if (this._realtimeClient && this._isConnected) {
      const result = this._realtimeClient.sendUserMessageContent([{ type: 'input_text', text: message}]);
      return result;
    }
    return false;;
  }

  public async connect() {
    if (!this._realtimeClient) return;
    await this._realtimeClient.connect();
    const modalities = this.getModalities();
    this._realtimeClient.updateSession({
      instructions,
      modalities,
      voice: 'shimmer',
      max_response_output_tokens: 1024,
      input_audio_transcription: { model: 'whisper-1' },
      turn_detection: this._inputMode === 'server-vad' ? { type: 'server_vad' } : null
    });
    this.setupListeners();
    this._isConnected = true;
  }

  public error$ = new Subject<any>();
  public response$ = new Subject<any>();
  public conversationCreated$ = new Subject<void>();
  public conversationInterrupted$ = new Subject<void>();
  public conversationItems$ = new BehaviorSubject<any[]>([]);
  public audioDeltaItem$ = new BehaviorSubject<any>({id: null, audio: null });
  public audioCompletedItem$ = new BehaviorSubject<any>({id: null, audio: null });

  private setupListeners() {
    if (!this._realtimeClient) return;

    this._realtimeClient.on('error', (event: any) => {
      console.error(event);
      this.error$.next(event);
    });

    this._realtimeClient.on('conversation.created', async () => {
      console.log('convo created log');
      this.conversationCreated$.next();
    });

    this._realtimeClient.on('conversation.interrupted', async () => {
      console.log('convo interrupted');
      this.conversationInterrupted$.next();
    });

    this._realtimeClient.on('response.done', (event: any) => {
      console.log('got a new response...(response done)', event);
      this.response$.next(event);
    });

    this._realtimeClient.on('conversation.updated', async ({ item, delta }: any) => {
      console.log('conversation updated', item, delta);

      if (delta?.audio) {
        console.log('partial audio');
        this.audioDeltaItem$.next({ id: item.id, audio: delta.audio });
        // this.wavStreamPlayer.add16BitPCM(delta.audio, item.id);
      }

      if (item.status === 'completed' && item.formatted.audio?.length) {
        // const wavFile = await WavRecorder.decode(item.formatted.audio, 24000, 24000);
        // item.formatted.file = wavFile;
        const wavFile = encodeWAV(item.formatted.audio);
        item.formatted.file = wavFile;
        console.log('new item?', item);
        this.audioCompletedItem$.next({ id: item.id, audio: wavFile });
      }

      if (this._realtimeClient) {
        const items = this._realtimeClient?.conversation.getItems();
        this.conversationItems$.next(items);
      }

    });
  }

  public disconnect() {
    if (!this._realtimeClient) return;
    this._realtimeClient.disconnect();
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
    if (!this._realtimeClient) return;
    const wasConnected = this._isConnected;
    if (wasConnected) this.disconnect();
    this._realtimeClient.updateSession({ modalities: this.getModalities() });
    if (wasConnected) await this.connect();
  }

  public setInputToVAD() {
    this._inputMode = 'server-vad';
    if (!this._realtimeClient) return;
    this._realtimeClient.updateSession({ turn_detection: this._inputMode === 'server-vad' ? { type: 'server_vad' } : null });
  }

  public setInputToPTT() {
    this._inputMode = 'push-to-talk';
    if (!this._realtimeClient) return;
    this._realtimeClient.updateSession({ turn_detection: null });
  }

  private getModalities() {
    const modalities = ['text'];
    if (this._outputMode === 'audio') modalities.push('audio');
    return modalities;
  }
}

const instructions = `You are a journaling assistant, facilitating journal entries. Aim for a balanced conversation that touches on wellness and productivity, but don't explicitly state these as goals. Respond to the user's input and encourage further reflection. Use subtle, empathetic language to prompt the user to explore their thoughts and feelings. Don't be too verbose and don't paraphrase the users words back to them. Keep a reflective style, but feel free to combine the style with others based on conversation specifics. Your tone should be empathetic, understanding, encouraging and supportive. The conversation should last a couple of minutes, be mindful of that.`

const instructionsForAnalysis = `Summarize the following conversation in a way that could be helpful for a therapist or coach. What is occupying the users mind, how is their mood etc.`;