import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ConversationItem } from 'src/app/models/conversation';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.scss']
})
export class ConversationComponent {
  @Input() items: ConversationItem[] = [];
  @Output() deleteItem = new EventEmitter<string>();

  onDeleteConversationItem(id: string): void {
    this.deleteItem.emit(id);
  }

  getSpeakerName(conversationItem: ConversationItem): string {
    return (conversationItem.role || conversationItem.type || '')
      .replace('_', ' ')
      .replace('assistant', 'JournAI')
      .replace('user', 'User');
  }
}
