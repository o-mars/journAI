import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AudioService } from 'src/app/services/audio.service';
import { OpenaiRealtimeClientService } from 'src/app/services/openai-realtime-client.service';

@Component({
  selector: 'app-new-entry',
  templateUrl: './new-entry.component.html',
  styleUrls: ['./new-entry.component.scss']
})
export class NewEntryComponent implements OnInit, OnDestroy {
  @ViewChild('clientCanvas', { static: true }) clientCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('serverCanvas', { static: true }) serverCanvasRef!: ElementRef<HTMLCanvasElement>;

  isPushToTalkMode = false;
  isRecording = false;
  inputText = '';
  private isLoaded = true;
  private clientCtx: CanvasRenderingContext2D | null = null;
  private serverCtx: CanvasRenderingContext2D | null = null;

  constructor(private audioService: AudioService, private realtimeService: OpenaiRealtimeClientService, private router: Router) {
    this.audioService.micStream$.subscribe(x => console.log('getting mic stream data!'));
  }
  
  sendTextMessage() {
    console.log('send text message: ', this.inputText);
    this.realtimeService.sendMessage(this.inputText);
    this.inputText = '';
  }

  complete() {
    this.router.navigate(['/main']);
  }

  ngOnInit(): void {
    this.startRendering();
  }

  ngOnDestroy(): void {
    this.isLoaded = false; // Stop rendering on destroy
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

  private startRendering(): void {
    const clientCanvas = this.clientCanvasRef.nativeElement;
    const serverCanvas = this.serverCanvasRef.nativeElement;

    const render = () => {
      if (this.isLoaded) {
        if (clientCanvas) {
          if (!clientCanvas.width || !clientCanvas.height) {
            clientCanvas.width = clientCanvas.offsetWidth;
            clientCanvas.height = clientCanvas.offsetHeight;
          }
          this.clientCtx = this.clientCtx || clientCanvas.getContext('2d');
          if (this.clientCtx) {
            this.clientCtx.clearRect(0, 0, clientCanvas.width, clientCanvas.height);
            const result = this.isRecording
              ? this.getClientFrequencies()
              : { values: new Float32Array([0]) };
            this.drawBars(clientCanvas, this.clientCtx, result.values, '#0099ff');
          }
        }

        if (serverCanvas) {
          if (!serverCanvas.width || !serverCanvas.height) {
            serverCanvas.width = serverCanvas.offsetWidth;
            serverCanvas.height = serverCanvas.offsetHeight;
          }
          this.serverCtx = this.serverCtx || serverCanvas.getContext('2d');
          if (this.serverCtx) {
            this.serverCtx.clearRect(0, 0, serverCanvas.width, serverCanvas.height);
            const result = this.getServerFrequencies();
            this.drawBars(serverCanvas, this.serverCtx, result.values, '#009900');
          }
        }
        window.requestAnimationFrame(render);
      }
    };

    render();
  }

  private getClientFrequencies() {
    // Replace with actual frequency data from your audio recorder
    return { values: new Float32Array([0.5, 0.8, 0.3, 0.6]) };
  }

  private getServerFrequencies() {
    // Replace with actual frequency data from your audio player
    return { values: new Float32Array([0.4, 0.6, 0.2, 0.7]) };
  }

  private drawBars(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    data: Float32Array,
    color: string
  ) {
    ctx.fillStyle = color;
    const barWidth = 10;
    for (let i = 0; i < data.length; i++) {
      const barHeight = data[i] * canvas.height;
      const x = i * (barWidth + 2);
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
    }
  }
}
