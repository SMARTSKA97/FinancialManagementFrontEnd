import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, computed, signal, OnInit } from '@angular/core';
import { Account } from '../../accounts/account';
import { DashboardState } from '../../../core/state/dashboard-state.service';
import { DashboardSummary, SpendingByCategory } from '../dashboard';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  imports: [CardModule, ChartModule, ProgressSpinnerModule, CurrencyPipe, DatePipe, NgClass, ButtonModule, RouterLink, DatePickerModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard implements OnInit {
  public state = inject(DashboardState);
  private cdr = inject(ChangeDetectorRef);

  // Expose signals for easier template access
  summary = this.state.summary;
  isLoading = this.state.isLoading;
  insights = this.state.insights;
  selectedGlobalDate = this.state.selectedDate;

  // Local Insights UI State
  insightType = signal<'amount' | 'timeline' | 'category' | 'account'>('amount');
  isAscending = signal<boolean>(false);

  // Date Picker model
  localDate = new Date();

  // Compute chart data from the state signal
  spendingChartData = computed(() => {
    const data = this.state.spending();
    const documentStyle = getComputedStyle(document.documentElement);

    // Premium curated aesthetic colors for the doughnut chart
    const colors = [
      '#3B82F6', // blue-500
      '#8B5CF6', // purple-500
      '#14B8A6', // teal-500
      '#F97316', // orange-500
      '#EC4899', // pink-500
      '#06B6D4', // cyan-500
      '#6366F1'  // indigo-500
    ];

    const hoverColors = [
      '#60A5FA', // blue-400
      '#A78BFA', // purple-400
      '#2DD4BF', // teal-400
      '#FB923C', // orange-400
      '#F472B6', // pink-400
      '#22D3EE', // cyan-400
      '#818CF8'  // indigo-400
    ];

    return {
      labels: data?.map(item => item.categoryName) || [],
      datasets: [
        {
          data: data?.map(item => item.totalAmount) || [],
          backgroundColor: colors,
          hoverBackgroundColor: hoverColors,
          borderWidth: 0,
          borderRadius: 6, // Smooth edges for doughnut slices
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
    this.localDate = this.selectedGlobalDate();
    this.state.refresh();
  }

  ngOnInit() {
    // Delay slightly to ensure theme CSS variables are computed on the body
    setTimeout(() => {
      this.setupSpendingChartOptions();
      this.cdr.markForCheck();
    }, 50);
  }

  onDateChange(newDate: Date) {
    if (newDate) {
      this.state.updateDate(newDate);
    }
  }

  toggleInsight(type: 'amount' | 'timeline' | 'category' | 'account') {
    if (this.insightType() === type) {
      this.isAscending.set(!this.isAscending());
    } else {
      this.insightType.set(type);
      this.isAscending.set(false); // default to descending for the new type
    }
  }

  setupSpendingChartOptions(): void {
    const documentStyle = getComputedStyle(document.body);
    const textColor = documentStyle.getPropertyValue('--text-color') || '#9ca3af'; // Fallback to accessible gray
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#4b5563';

    this.spendingChartOptions = {
      cutout: '70%', // Creates the elegant doughnut hole
      plugins: {
        legend: {
          position: 'right', // Move legend to the side rather than top
          labels: {
            usePointStyle: true,
            color: textColor,
            padding: 20,
            font: {
              size: 13,
              family: 'inherit'
            }
          }
        },
        tooltip: {
          backgroundColor: documentStyle.getPropertyValue('--surface-overlay'),
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: surfaceBorder,
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true
        }
      },
      animation: {
        animateScale: true, // Smooth pop-in animation
        animateRotate: true
      }
    };
  }
}
