import { Component, OnDestroy } from '@angular/core';
import { OpenaiRealtimeClientService } from 'src/app/services/openai-realtime-client.service';
import { WhisperService } from 'src/app/services/whisper.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  title = 'angular';

  constructor(
    private whisperService: WhisperService,
    private openAIService: OpenaiRealtimeClientService
  ) {}

  ngOnDestroy() {
    this.whisperService.cleanup();
    this.openAIService.disconnect();
  }
}
