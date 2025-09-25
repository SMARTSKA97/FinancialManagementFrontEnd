import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';
import { Account } from '../../accounts/account';
import { DashboardService, SpendingByCategory } from '../dashboard';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-dashboard',
  imports: [CardModule,ChartModule ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private dashboard = inject(DashboardService);
  private cdr = inject(ChangeDetectorRef);
  private account = inject(Account);
  spendingChartData: any;
  spendingChartOptions: any;
  isLoading: boolean = false;
  summary: any;
  accounts:any;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    const summary$ = this.dashboard.getSummary();
    const accounts$ = this.account.getAccounts();
    const spending$ = this.dashboard.getSpendingByCategory(); // <-- Fetch chart data

    forkJoin([summary$, accounts$, spending$]).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: ([summaryData, accountsData, spendingData]) => {
        this.summary = summaryData;
        this.accounts = accountsData;
        this.setupSpendingChart(spendingData); // <-- Call the new chart setup method
      },
      error: (err) => console.error('Failed to load dashboard data', err)
    });
  }

  // --- ADD THIS NEW METHOD ---
  setupSpendingChart(data: SpendingByCategory[]): void {
    const documentStyle = getComputedStyle(document.documentElement);

    this.spendingChartData = {
      labels: data.map(item => item.categoryName),
      datasets: [
        {
          data: data.map(item => item.totalAmount),
          backgroundColor: [
            documentStyle.getPropertyValue('--blue-500'),
            documentStyle.getPropertyValue('--yellow-500'),
            documentStyle.getPropertyValue('--green-500'),
            documentStyle.getPropertyValue('--red-500'),
            documentStyle.getPropertyValue('--purple-500'),
            documentStyle.getPropertyValue('--orange-500'),
          ],
        }
      ]
    };

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
