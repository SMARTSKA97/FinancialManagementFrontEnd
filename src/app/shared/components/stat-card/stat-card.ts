import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
    selector: 'app-stat-card',
    standalone: true,
    imports: [CommonModule, CardModule],
    template: `
    <p-card [style]="{'height': '100%'}">
      <div class="flex flex-column gap-2">
        <div class="flex align-items-center justify-content-between">
          <span class="text-sm font-medium text-muted-color">{{ label() }}</span>
          <i [class]="icon()" [style]="{'color': iconColor()}" class="text-xl"></i>
        </div>
        <div class="flex align-items-end justify-content-between">
          <div>
            <span class="text-2xl font-bold line-height-1">{{ value() }}</span>
            @if (secondaryValue()) {
              <div class="text-xs text-muted-color mt-1">{{ secondaryValue() }}</div>
            }
          </div>
          @if (trend()) {
            <span [class]="trendClass" class="text-sm font-medium">
              {{ trend() }}
            </span>
          }
        </div>
      </div>
    </p-card>
  `,
    styles: [`
    :host {
      display: block;
      height: 100%;
    }
    .text-muted-color {
      color: var(--text-muted);
    }
  `]
})
export class StatCard {
    label = input.required<string>();
    value = input.required<string | number>();
    icon = input<string>('pi pi-circle');
    iconColor = input<string>('var(--primary-color)');
    secondaryValue = input<string>();
    trend = input<string>();
    trendPositive = input<boolean>(true);

    get trendClass(): string {
        return this.trendPositive() ? 'text-green-500' : 'text-red-500';
    }
}
