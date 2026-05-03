import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { DashboardService } from '../../Services/dashboard.service';

@Component({
  selector: 'app-company-performance-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './company-performance-chart.html',
  styleUrls: ['./company-performance-chart.css']
})
export class CompanyPerformanceChartComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  private dashboardService = inject(DashboardService);

  isLoading = true;
  companyData: any[] = [];

  totalRevenue: string = '';
  averageRevenue: string = '';
  topCompany: string = '';

  public barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12, weight: 'bold' },
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        callbacks: {
          label: (context: any) => {
            return `Revenue: ${context.raw.toLocaleString()} EGP`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Revenue (EGP)',
          font: { weight: 'bold' }
        },
        ticks: {
          callback: (val: any) => val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val
        }
      },
      y: {
        title: {
          display: true,
          text: 'Companies',
          font: { weight: 'bold' }
        }
      }
    }
  };

  public barChartType: ChartType = 'bar';
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };

  ngOnInit() {
    this.dashboardService.getCompanies().subscribe({
      next: (response: any) => {
        this.companyData = response?.data ?? [];
        this.isLoading = false;
        this.loadChartData();
        this.calculateStats();
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  loadChartData() {
    const sortedData = [...this.companyData].sort((a, b) => b.revenue - a.revenue);

    const colors = [
      '#3b82f6', '#6c63ac', '#10b981', '#f59e0b',
      '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899',
      '#14b8a6', '#f97316', '#84cc16'
    ];

    this.barChartData = {
      labels: sortedData.map(c => c.company),
      datasets: [{
        label: 'Revenue (EGP)',
        data: sortedData.map(c => c.revenue),
        backgroundColor: sortedData.map((_, i) => colors[i % colors.length]),
        borderRadius: 8,
        barPercentage: 0.7
      }]
    };

    this.chart?.update();
  }

  calculateStats() {
    if (!this.companyData.length) return;

    const total = this.companyData.reduce((sum, c) => sum + c.revenue, 0);
    this.totalRevenue = `${total.toLocaleString()} EGP`;

    const avg = total / this.companyData.length;
    this.averageRevenue = `${Math.round(avg).toLocaleString()} EGP`;

    const top = [...this.companyData].sort((a, b) => b.revenue - a.revenue)[0];
    this.topCompany = `${top.company} (${top.revenue.toLocaleString()} EGP)`;
  }
}
