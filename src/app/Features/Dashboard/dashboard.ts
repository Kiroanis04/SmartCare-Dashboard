import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Adminprofile } from './Components/AdminProfile/adminprofile';
import { CardsComponent } from './Components/Cards/cards';
import { BarChartComponent } from './Components/branch-comparsion/branch-comparsion';
import { DonutChartComponent } from './Components/category-distribution-chart/category-distribution-chart';
import { DashboardService } from './Services/dashboard.service';
import { CardData, AdminProfile } from './Models/dashboard.model';
import { CompanyPerformanceChartComponent } from './Components/company-performance-chart/company-performance-chart';
import { LowStockTableComponent } from './Components/low-stock-table/low-stock-table';
import { Sidebar } from "../../Shared/Components/sidebar/sidebar";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, Adminprofile, CardsComponent, BarChartComponent, DonutChartComponent, CompanyPerformanceChartComponent, LowStockTableComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  cardData?: CardData;
  private subscriptions: Subscription[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    // Subscribe to card data
    this.subscriptions.push(
      this.dashboardService.getCardData().subscribe((data: CardData) => {
        this.cardData = data;
      })
    );

    // Subscribe to admin profile
  //   this.subscriptions.push(
  //     this.dashboardService.getAdminProfile().subscribe((profile: AdminProfile) => {
  //       this.adminProfile = profile;
  //     })
  //   );
  // }
  }
  onCardClick(cardId: string) {
    console.log('Card clicked:', cardId);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
