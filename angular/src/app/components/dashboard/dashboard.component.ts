import { Component } from '@angular/core';
import { Router } from '@angular/router';
// import { OpenaiRealtimeClientService } from 'src/app/services/openai-realtime-client.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  constructor(
    // private realtimeClient: OpenaiRealtimeClientService,
    private router: Router
  ) {
    
  }

  async handleStart() {
    // await this.realtimeClient.connect();
    this.router.navigate(['/new-entry']);
  }
}
