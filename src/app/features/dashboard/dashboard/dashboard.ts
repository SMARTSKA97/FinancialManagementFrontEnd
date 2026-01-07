import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { finalize, firstValueFrom, forkJoin } from 'rxjs';
import { Account } from '../../accounts/account';
import { DashboardService, DashboardSummary, SpendingByCategory } from '../dashboard';
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
export class Dashboard implements OnInit {
  private dashboardService = inject(DashboardService);
  private cdr = inject(ChangeDetectorRef); // <-- Inject ChangeDetectorRef

  summary: DashboardSummary | null = null;
  spendingChartData: any;
  spendingChartOptions: any;
  isLoading = false;

  constructor() {
    this.setupSpendingChartOptions();
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  async loadDashboardData(): Promise<void> {
    this.isLoading = true;

    try {
      const summary$ = this.dashboardService.getSummary();
      const spending$ = this.dashboardService.getSpendingByCategory();

      // Wait for both API calls to complete
      const [summaryData, spendingData] = await Promise.all([
        firstValueFrom(summary$),
        firstValueFrom(spending$)
      ]);
      this.summary = summaryData;
      this.setupSpendingChart(spendingData);

    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  setupSpendingChart(data: SpendingByCategory[]): void {
    this.spendingChartData = {
      labels: data?.map(item => item.categoryName) || [],
      datasets: [
        {
          data: data?.map(item => item.totalAmount) || [],
        }
      ]
    };
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
