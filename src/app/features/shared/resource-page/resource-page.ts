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
  // Use modern inject() for cleaner code
  public crudService = inject(GenericCrud<T>);
  private dialogService = inject(DialogService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);
  // --- CONFIGURATION INPUTS ---
  @Input() title: string = '';
  @Input() backLinkPath?: string;
  @Input({ required: true }) endpoint!: string;
  @Input({ required: true }) columns!: ColumnDefinition[];
  @Input({ required: true }) formComponent!: Type<any>;

  // --- OBSERVABLES FOR THE TEMPLATE ---
  items$ = this.crudService.items$;
  isLoading$ = this.crudService.isLoading$;

  ref: DynamicDialogRef | undefined;



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

    this.crudService.search(this.endpoint, { pageNumber: 1, pageSize: 10 });
  }

  async showForm(itemToEdit?: T): Promise<void> {
    const isEditMode = !!itemToEdit;
    this.ref = this.dialogService.open(this.formComponent, {
      header: `${isEditMode ? 'Edit' : 'New'} ${this.title.slice(0, -1)}`,
      width: '400px',
      modal: true,

      data: itemToEdit
    });

    const result = await firstValueFrom(this.ref.onClose);
    if (result) {
      // The service now handles the update logic, so the component is simpler
      this.crudService.upsert(this.endpoint, result)
        .then(() => this.messageService.add({ severity: 'success', summary: 'Success', detail: `${this.title.slice(0, -1)} saved` }))
        .catch(err => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message || 'Operation failed' }));
    }
  }

  deleteItem(item: T): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this item?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // The service now handles the delete logic
        this.crudService.delete(this.endpoint, item)
          .then(() => this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Item deleted' }))
          .catch(err => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message || 'Operation failed' }));
      }
    });
  }
}
