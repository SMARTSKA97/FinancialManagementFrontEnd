import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ContentChild, Input, OnChanges, SimpleChanges, TemplateRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';

export interface ColumnDefinition {
  field: string;
  header: string;
  isCurrency?: boolean;
  isDate?: boolean; // For date formatting
  isTransaction?: boolean; // For coloring income/expense
  isLink?: boolean; // To make the cell a link
  linkPath?: string; // e.g., 'accounts' or 'transactions'
}

@Component({
  selector: 'app-data-table',
  imports: [CommonModule, TableModule, RouterLink],
  standalone: true, 
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss'
})
export class DataTable implements OnChanges{
  @Input() data: any[] = [];
  @Input() columns: ColumnDefinition[] = [];
  @ContentChild('actions') actionsTemplate!: TemplateRef<any>;


  constructor(private cdr: ChangeDetectorRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.cdr.detectChanges();
    }
  }

  constructLink(path: string, item: any): any[] {
    const replacedPath = path.replace(':id', item.id);
    // Add a leading '/' to make the path absolute from the root
    return ['/', ...replacedPath.split('/')];
  }
}
