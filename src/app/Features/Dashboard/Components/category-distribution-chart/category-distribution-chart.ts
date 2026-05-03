import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartOptions, ChartData, ChartType } from 'chart.js';
import { DashboardService } from '../../Services/dashboard.service';

@Component({
  selector: 'app-donut-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './category-distribution-chart.html',
  styleUrls: ['./category-distribution-chart.css']
})
export class DonutChartComponent implements OnInit {
  @Input() title: string = 'Category Distribution';

  private dashboardService = inject(DashboardService);

  isLoading = true;
  categories: any[] = [];
  selectedCategory: any = null;
  totalValue: number = 0;

  private colors = [
    '#3b82f6', '#6c63ac', '#10b981', '#f59e0b',
    '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899',
    '#14b8a6', '#f97316'
  ];

  public pieChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 11 },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#ffffff',
        bodyColor: '#94a3b8',
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.raw as number;
            const percentage = ((value / this.totalValue) * 100).toFixed(1);
            return `${label}: ${this.formatValue(value)} EGP (${percentage}%)`;
          }
        }
      }
    }
  };

  public pieChartType: ChartType = 'pie';
  public pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: []
  };

  ngOnInit() {
    this.dashboardService.getCategories().subscribe({
      next: (response: any) => {
        const data = response?.data ?? [];
        this.categories = data.map((item: any, index: number) => ({
          name: item.category,
          value: item.revenue,
          percentage: item.percentage,
          color: this.colors[index % this.colors.length]
        }));
        this.isLoading = false;
        this.calculateTotal();
        this.updateChartData();
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  calculateTotal() {
    this.totalValue = this.categories.reduce((sum, cat) => sum + cat.value, 0);
  }

  updateChartData() {
    this.pieChartData = {
      labels: this.categories.map(cat => cat.name),
      datasets: [{
        data: this.categories.map(cat => cat.value),
        backgroundColor: this.categories.map(cat => cat.color),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 10
      }]
    };
  }

  selectCategory(category: any) {
    this.selectedCategory = this.selectedCategory === category ? null : category;
  }

  formatValue(value: number): string {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return `${value}`;
  }
}
