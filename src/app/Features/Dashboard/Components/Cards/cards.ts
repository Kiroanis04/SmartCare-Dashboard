import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardData, DashboardCard } from '../../Models/dashboard.model';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cards.html',
  styleUrls: ['./cards.css']
})
export class CardsComponent implements OnChanges {
  @Input() cardData?: CardData;
  @Output() cardClick = new EventEmitter<string>();

  cards: DashboardCard[] = [];

  private iconPaths = {
    accounts: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
    revenue: 'M12 2v20M17 7H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6M18 12 H6',
    sales: 'M3 3h18v18H3zM8 8h8v8H8zM16 3v18M8 3v18M3 8h18M3 16h18',
    orders: 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0'
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cardData'] && this.cardData) {
      this.updateCards();
    }
  }

  private updateCards() {
    if (!this.cardData) return;

    this.cards = [
      {
        id: 'total-accounts',
        title: 'Total Accounts',
        value: this.cardData.totalAccounts,
        icon: this.iconPaths.accounts,
        iconGradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        trend: this.cardData.trends.accounts,
        format: 'number'
      },
      {
        id: 'revenue',
        title: 'Revenue',
        value: this.cardData.revenueThisMonth,
        icon: this.iconPaths.revenue,
        iconGradient: 'linear-gradient(135deg, #10b981, #059669)',
        trend: this.cardData.trends.revenue,
        format: 'currency'
      },
      {
        id: 'sales',
        title: 'Total Sales',
        value: this.cardData.totalSalesThisMonth,
        icon: this.iconPaths.sales,
        iconGradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
        trend: this.cardData.trends.sales,
        format: 'currency'
      },
      {
        id: 'orders',
        title: 'Total Orders',
        value: this.cardData.totalOrdersThisMonth,
        icon: this.iconPaths.orders,
        iconGradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        trend: this.cardData.trends.orders,
        format: 'number'
      }
    ];
  }

  onCardClick(cardId: string) {
    this.cardClick.emit(cardId);
  }
}
