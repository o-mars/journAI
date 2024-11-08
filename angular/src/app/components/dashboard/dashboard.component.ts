import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { HeaderService } from 'src/app/services/header.service';
import { OpenaiRealtimeClientService } from 'src/app/services/openai-realtime-client.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  constructor(
    private realtimeClient: OpenaiRealtimeClientService,
    private router: Router,
    private authService: AuthService,
    private headerService: HeaderService,
  ) {
  }

  ngOnInit() {
    this.headerService.setTitle('JournAI');
    this.headerService.setRightActionIcon('feather-log-out.svg');
    // this.headerService.actionClicked$.subscribe(() => this.authService.logout());
    console.log('dash component again');
  }

  async handleStart() {
    // await this.realtimeClient.connect();
    this.router.navigate(['/new-entry']);
  }

  async handleSettings() {
    this.router.navigate(['/settings']);
  }
}
