import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { HeaderService } from 'src/app/services/header.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input() title: string = 'JournAI';
  @Input() leftIcon: string = '';
  @Input() rightIcon: string = '';
  
  @Output() leftAction = new EventEmitter<void>();
  @Output() rightAction = new EventEmitter<void>();

  constructor() {}

  leftActionClicked() {
    this.leftAction.emit();
  }

  rightActionClicked() {
    this.rightAction.emit();
  }
}
