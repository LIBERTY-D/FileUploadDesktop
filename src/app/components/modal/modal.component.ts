import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalType } from '../../types/modal.type';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class ModalComponent {
  @Input() modalData!: ModalType
  @Output() closeModalEvent:EventEmitter<boolean>= new EventEmitter<boolean>(false)
  closeModal() {
    this.closeModalEvent.emit(false)
  }
  confirmDelete() {
    this.closeModalEvent.emit(true)
  }
}
