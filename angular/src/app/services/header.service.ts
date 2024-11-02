import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  private title = new BehaviorSubject<string>('JournAI');
  private rightActionIcon = new BehaviorSubject<string | null>(null);
  private actionClicked = new Subject<void>();

  public title$ = this.title.asObservable();
  public rightActionIcon$ = this.rightActionIcon.asObservable();
  public actionClicked$ = this.actionClicked.asObservable();

  setTitle(newTitle: string): void {
    this.title.next(newTitle);
  }

  setRightActionIcon(icon: string | null): void {
    this.rightActionIcon.next(icon);
  }

  triggerAction(): void {
    this.actionClicked.next();
  }
}
