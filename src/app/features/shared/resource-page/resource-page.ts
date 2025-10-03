import { Component, inject, Input, OnInit, Type } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { GenericCrud } from '../../../core/services/generic-crud';
import { ColumnDefinition, DataTable } from '../../../shared/components/data-table/data-table';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GenericApi } from '../../../core/services/generic-api';

@Component({
  selector: 'app-resource-page',
  imports: [CommonModule, CardModule, ButtonModule, TableModule, DataTable, ProgressSpinnerModule, ConfirmDialogModule, ToastModule, RouterLink],
  templateUrl: './resource-page.html',
  styleUrl: './resource-page.scss',
  providers: [DialogService, ConfirmationService, MessageService, GenericCrud]

})
export class ResourcePage<T extends { id: number }> implements OnInit {
  @Input() title: string = '';
  @Input() backLinkPath?: string;
  @Input() endpoint!: string;
  @Input() columns!: ColumnDefinition[];
  @Input() formComponent!: Type<any>;

  private _items = new BehaviorSubject<T[]>([]);
  items$ = this._items.asObservable();
  
  private _isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this._isLoading.asObservable();

  ref: DynamicDialogRef | undefined;

  constructor(
    private route: ActivatedRoute,
    private apiService: GenericApi,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  async ngOnInit(): Promise<void> {
    const routeData = await firstValueFrom(this.route.data);
    const params = await firstValueFrom(this.route.paramMap);
    
    this.title = routeData['title'];
    this.columns = routeData['columns'];
    this.formComponent = routeData['formComponent'];
    this.backLinkPath = routeData['backLinkPath'];
    
    let endpoint = routeData['endpoint'];
    if (params.has('id')) {
      endpoint = endpoint.replace(':id', params.get('id')!);
    }
    this.endpoint = endpoint;
    
    this.loadItems();
  }

  async loadItems(): Promise<void> {
    this._isLoading.next(true);
    try {
      // Using a default query for now. This will be expanded for search/sort.
      const queryParams = { pageNumber: 1, pageSize: 10 }; 
      const response = await firstValueFrom(this.apiService.search<T>(this.endpoint, queryParams));
      if (response.result?.data) {
        this._items.next(response.result.data);
      }
    } catch (err) {
      this.messageService.add({severity:'error', summary: 'Error', detail: 'Failed to load data'});
    } finally {
      this._isLoading.next(false);
    }
  }

  async showForm(itemToEdit?: T): Promise<void> {
    const isEditMode = !!itemToEdit;
    this.ref = this.dialogService.open(this.formComponent, {
      header: `${isEditMode ? 'Edit' : 'New'} ${this.title.slice(0, -1)}`,
      width: '400px',
      data: itemToEdit
    });

    const result = await firstValueFrom(this.ref.onClose);
    if (result) {
      try {
        const response = await firstValueFrom(this.apiService.upsert<T>(this.endpoint, result));
        if (response.apiResponseStatus === 0) { // Success
          this.messageService.add({severity:'success', summary: 'Success', detail: `${this.title.slice(0, -1)} saved`});
          this.loadItems(); // Refresh the list
        } else {
          this.messageService.add({severity:'error', summary: 'Error', detail: response.message});
        }
      } catch (err) {
        this.messageService.add({severity:'error', summary: 'Error', detail: 'Operation failed'});
      }
    }
  }

  deleteItem(item: T): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this item?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          const response = await firstValueFrom(this.apiService.delete<boolean>(this.endpoint, item.id));
           if (response.apiResponseStatus === 0) { // Success
            this.messageService.add({severity:'success', summary: 'Success', detail: 'Item deleted'});
            this.loadItems(); // Refresh the list
          } else {
            this.messageService.add({severity:'error', summary: 'Error', detail: response.message});
          }
        } catch (err) {
          this.messageService.add({severity:'error', summary: 'Error', detail: 'Operation failed'});
        }
      }
    });
  }
}