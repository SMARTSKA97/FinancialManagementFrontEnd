import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface PublicStatsDto {
  totalUsers: number;
  totalAccounts: number;
  totalTransactions: number;
}

interface ApiResult<T> {
  isSuccess: boolean;
  value: T;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, ButtonModule, DecimalPipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Home implements OnInit {
  private http = inject(HttpClient);

  stats = signal<PublicStatsDto>({
    totalUsers: 0,
    totalAccounts: 0,
    totalTransactions: 0
  });

  ngOnInit() {
    this.http.get<ApiResult<PublicStatsDto>>(
      `${environment.apiBaseUrl}/Dashboard/public-stats`
    ).subscribe({
      next: (res) => {
        if (res.isSuccess && res.value) {
          this.stats.set(res.value);
        }
      },
      error: () => {
        // Fallback to zeros — no fake data
      }
    });
  }
}
