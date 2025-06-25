import { Component, Input, EventEmitter } from '@angular/core';
import { TableComponent } from '../table/table.component';
import { Clicked } from '../../types/enums.type';
import { SearchFileService } from '../../services/search-file.service';
import { CommonModule } from '@angular/common';
import { UpdateTrashDataService } from '../../services/update-trash-data.service';
import { UpdateDataService } from '../../services/update-data.service';

@Component({
  selector: 'app-searchbar',
  standalone: true,
  imports: [TableComponent, CommonModule],
  templateUrl: './searchbar.component.html',
  styleUrl: './searchbar.component.css',
})
export class SearchbarComponent {
  @Input() clickedSiderBarComponent!: Clicked;
  updateDataService!: UpdateDataService;
  updateTrashDataService!: UpdateTrashDataService;
  searchFileService!: SearchFileService;
  constructor(
    searchFileService: SearchFileService,
    updateDataService: UpdateDataService,
    updateTrashDataService: UpdateTrashDataService
  ) {
    this.updateDataService = updateDataService;
    this.updateTrashDataService = updateTrashDataService;
    this.searchFileService = searchFileService;
  }

  onChangeInputSearch(element: EventTarget) {
    const inputElement = element as HTMLInputElement;
    this.searchFileService.updateSearchText(inputElement.value);
  }
}
