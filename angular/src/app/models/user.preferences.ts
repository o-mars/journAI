export type InputMode = 'server-vad' | 'push-to-talk' | 'text';
export type OutputMode = 'audio' | 'text';

export class UserPreferences {
  public inputMode: InputMode;
  public outputMode: OutputMode;
  public shouldAutostart: boolean;
  public shouldSaveChats: boolean;
  public lastUpdated: Date;

  constructor(input: InputMode = 'server-vad', output: OutputMode = 'audio', autoStart: boolean = false, shouldSaveChats: boolean = false, time: Date = new Date()) { 
    this.inputMode = input;
    this.outputMode = output;
    this.shouldAutostart = autoStart;
    this.shouldSaveChats = shouldSaveChats;
    this.lastUpdated = time;
  }
}