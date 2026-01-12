import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, computed } from '@angular/core';
import { Account } from '../../accounts/account';
import { DashboardState } from '../../../core/state/dashboard-state.service';
import { DashboardSummary, SpendingByCategory } from '../dashboard';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CurrencyPipe } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CardModule, ChartModule, ProgressSpinnerModule, CurrencyPipe, ButtonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard {
  public state = inject(DashboardState);
  private cdr = inject(ChangeDetectorRef);

  // Expose signals for easier template access
  summary = this.state.summary;
  isLoading = this.state.isLoading;

  // Compute chart data from the state signal
  spendingChartData = computed(() => {
    const data = this.state.spending();
    return {
      labels: data?.map(item => item.categoryName) || [],
      datasets: [
        {
          data: data?.map(item => item.totalAmount) || [],
        }
      ]
    };
  });

  hasChartData = computed(() => {
    const d = this.spendingChartData();
    return d.datasets[0].data.length > 0;
  });

  spendingChartOptions: any;

  constructor() {
    this.setupSpendingChartOptions();
    // Ensure fresh data on component load?
    // The state service loads on creation. If we navigate away and back, it shows cached data.
    // If we want fresh data, we can call refresh.
    // this.state.refresh(); 
    // Is it needed? If AccountState triggers refresh, then data is up to date.
    // If multiple tabs? User refreshes?
    // Calling refresh on init is safe.
    this.state.refresh();
  }

  setupSpendingChartOptions(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    this.spendingChartOptions = {
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            color: documentStyle.getPropertyValue('--text-color')
          }
        }
      }
    };
  }
}
