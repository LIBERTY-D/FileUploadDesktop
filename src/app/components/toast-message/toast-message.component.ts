import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Type } from '../../types/enums.type';

@Component({
  selector: 'app-toast-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-message.component.html',
  styleUrl: './toast-message.component.css'
})
export class ToastMessageComponent {
  @Input() message: string = '';
  @Input() type: Type = 'success';
  @Input() isVisible: boolean = false;

  closeToast() {
    this.isVisible = false;
  }
}
