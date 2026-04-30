import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Adminprofile } from './Components/AdminProfile/adminprofile';
import { CardsComponent } from './Components/Cards/cards';
import { DashboardService } from './Services/dashboard.service';
import { CardData, AdminProfile, BranchData } from './Models/dashboard.model';
import { BarChartComponent } from './Components/branch-comparsion/branch-comparsion';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, Adminprofile, CardsComponent, BarChartComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  cardData?: CardData;
  adminProfile!: AdminProfile;
  branchData: BranchData[] = [];
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
    this.subscriptions.push(
      this.dashboardService.getAdminProfile().subscribe((profile: AdminProfile) => {
        this.adminProfile = profile;
      })
    );
  }

  onCardClick(cardId: string) {
    console.log('Card clicked:', cardId);
    // Handle card click actions
    switch(cardId) {
      case 'total-accounts':
        // Navigate or show accounts details
        break;
      case 'revenue':
        // Show revenue details
        break;
      case 'sales':
        // Show sales details
        break;
      case 'orders':
        // Show orders details
        break;
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
