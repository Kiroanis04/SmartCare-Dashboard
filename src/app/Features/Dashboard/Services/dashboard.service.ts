import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { CardData, AdminProfile, BranchData, DateRange } from '../Models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // Private BehaviorSubjects
  private cardDataSubject = new BehaviorSubject<CardData>({
    totalAccounts: 15420,
    revenueThisMonth: 284500,
    totalSalesThisMonth: 1248,
    totalOrdersThisMonth: 3420,
    trends: {
      accounts: 12.5,
      revenue: 18.3,
      sales: 8.7,
      orders: 15.2
    }
  });

  private adminProfileSubject = new BehaviorSubject<AdminProfile>({
    id: 'admin-001',
    username: 'Alex Morgan',
    email: 'alex.morgan@admin.com',
    avatar: 'https://ui-avatars.com/api/?background=3b82f6&color=fff&rounded=true&size=80&bold=true&name=Alex&length=2',
    role: 'Administrator',
    lastLogin: new Date(),
    permissions: ['read', 'write', 'delete', 'manage_users']
  });

  // Branch Data - Real data for different time periods
  private branchDataCache: Map<string, BranchData[]> = new Map();

  constructor() {
    this.initializeBranchData();
  }

  private initializeBranchData() {
    // Current Month Data (Default)
    const currentMonthData: BranchData[] = [
      { name: 'Cairo Branch', revenue: 1250000, sales: 800000, orders: 342000, color: '#3b82f6' },
      { name: 'Alex Branch', revenue: 980000, sales: 987000, orders: 278000, color: '#10b981' },
      { name: 'Giza Branch', revenue: 750000, sales: 756000, orders: 215000, color: '#f59e0b' },
      { name: 'Port Said', revenue: 520000, sales: 523000, orders: 145000, color: '#8b5cf6' },
      { name: 'Ismailia', revenue: 380000, sales: 389000, orders: 108000, color: '#ec489a' },
      { name: 'Luxor Branch', revenue: 290000, sales: 29800, orders: 89000, color: '#06b6d4' }
    ];

    // Last Month Data
    const lastMonthData: BranchData[] = [
      { name: 'Cairo Branch', revenue: 1180000, sales: 1190, orders: 3250, color: '#3b82f6' },
      { name: 'Alex Branch', revenue: 920000, sales: 940, orders: 2650, color: '#10b981' },
      { name: 'Giza Branch', revenue: 710000, sales: 720, orders: 2050, color: '#f59e0b' },
      { name: 'Port Said', revenue: 490000, sales: 498, orders: 1380, color: '#8b5cf6' },
      { name: 'Ismailia', revenue: 360000, sales: 370, orders: 1020, color: '#ec489a' },
      { name: 'Luxor Branch', revenue: 275000, sales: 285, orders: 850, color: '#06b6d4' }
    ];

    // Last 3 Months Data
    const last3MonthsData: BranchData[] = [
      { name: 'Cairo Branch', revenue: 1100000, sales: 1120, orders: 3100, color: '#3b82f6' },
      { name: 'Alex Branch', revenue: 890000, sales: 900, orders: 2550, color: '#10b981' },
      { name: 'Giza Branch', revenue: 680000, sales: 690, orders: 1980, color: '#f59e0b' },
      { name: 'Port Said', revenue: 470000, sales: 480, orders: 1320, color: '#8b5cf6' },
      { name: 'Ismailia', revenue: 345000, sales: 355, orders: 980, color: '#ec489a' },
      { name: 'Luxor Branch', revenue: 260000, sales: 270, orders: 820, color: '#06b6d4' }
    ];

    // Last 6 Months Data
    const last6MonthsData: BranchData[] = [
      { name: 'Cairo Branch', revenue: 1050000, sales: 1080, orders: 2980, color: '#3b82f6' },
      { name: 'Alex Branch', revenue: 850000, sales: 860, orders: 2450, color: '#10b981' },
      { name: 'Giza Branch', revenue: 650000, sales: 660, orders: 1900, color: '#f59e0b' },
      { name: 'Port Said', revenue: 450000, sales: 460, orders: 1280, color: '#8b5cf6' },
      { name: 'Ismailia', revenue: 330000, sales: 340, orders: 950, color: '#ec489a' },
      { name: 'Luxor Branch', revenue: 250000, sales: 260, orders: 800, color: '#06b6d4' }
    ];

    // Last Year Data
    const lastYearData: BranchData[] = [
      { name: 'Cairo Branch', revenue: 980000, sales: 1000, orders: 2800, color: '#3b82f6' },
      { name: 'Alex Branch', revenue: 800000, sales: 810, orders: 2300, color: '#10b981' },
      { name: 'Giza Branch', revenue: 600000, sales: 610, orders: 1800, color: '#f59e0b' },
      { name: 'Port Said', revenue: 420000, sales: 430, orders: 1200, color: '#8b5cf6' },
      { name: 'Ismailia', revenue: 310000, sales: 320, orders: 900, color: '#ec489a' },
      { name: 'Luxor Branch', revenue: 235000, sales: 245, orders: 760, color: '#06b6d4' }
    ];

    // Store in cache
    this.branchDataCache.set('current', currentMonthData);
    this.branchDataCache.set('lastMonth', lastMonthData);
    this.branchDataCache.set('last3Months', last3MonthsData);
    this.branchDataCache.set('last6Months', last6MonthsData);
    this.branchDataCache.set('lastYear', lastYearData);
  }

  // Public Observables
  getCardData(): Observable<CardData> {
    return this.cardDataSubject.asObservable();
  }

  getAdminProfile(): Observable<AdminProfile> {
    return this.adminProfileSubject.asObservable();
  }

  // Get current values
  getCurrentCardData(): CardData {
    return this.cardDataSubject.value;
  }

  getCurrentAdminProfile(): AdminProfile {
    return this.adminProfileSubject.value;
  }

  // Update methods
  updateCardData(data: Partial<CardData>) {
    const currentData = this.cardDataSubject.value;
    this.cardDataSubject.next({ ...currentData, ...data });
  }

  updateAdminProfile(profile: Partial<AdminProfile>) {
    const currentProfile = this.adminProfileSubject.value;
    this.adminProfileSubject.next({ ...currentProfile, ...profile });
  }

  // Get Branch Data by Date Range
  getBranchDataByDateRange(dateRange: DateRange): Observable<BranchData[]> {
    // Simulate API call with actual data based on date range
    return of(this.calculateBranchDataForDateRange(dateRange)).pipe(delay(300));
  }

  private calculateBranchDataForDateRange(dateRange: DateRange): BranchData[] {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    const currentDate = new Date();

    // Calculate month difference
    const monthDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                      (endDate.getMonth() - startDate.getMonth());

    // Get current month start date
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const threeMonthsStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1);
    const sixMonthsStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1);
    const yearStart = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1);

    // Determine which data to return based on date range
    if (startDate >= currentMonthStart) {
      return this.branchDataCache.get('current') || [];
    } else if (startDate >= lastMonthStart) {
      return this.branchDataCache.get('lastMonth') || [];
    } else if (startDate >= threeMonthsStart) {
      return this.branchDataCache.get('last3Months') || [];
    } else if (startDate >= sixMonthsStart) {
      return this.branchDataCache.get('last6Months') || [];
    } else if (startDate >= yearStart) {
      return this.branchDataCache.get('lastYear') || [];
    }

    // Default to current data
    return this.branchDataCache.get('current') || [];
  }

  // Get aggregated summary data
  getBranchSummary(branchData: BranchData[]): {
    totalRevenue: number;
    totalSales: number;
    totalOrders: number;
    averageRevenue: number;
    topBranch: BranchData | null;
  } {
    if (!branchData.length) {
      return {
        totalRevenue: 0,
        totalSales: 0,
        totalOrders: 0,
        averageRevenue: 0,
        topBranch: null
      };
    }

    const totalRevenue = branchData.reduce((sum, b) => sum + b.revenue, 0);
    const totalSales = branchData.reduce((sum, b) => sum + b.sales, 0);
    const totalOrders = branchData.reduce((sum, b) => sum + b.orders, 0);
    const averageRevenue = totalRevenue / branchData.length;
    const topBranch = [...branchData].sort((a, b) => b.revenue - a.revenue)[0];

    return {
      totalRevenue,
      totalSales,
      totalOrders,
      averageRevenue,
      topBranch
    };
  }

  // Refresh dashboard data
  refreshDashboardData() {
    const currentData = this.cardDataSubject.value;
    const newData: CardData = {
      totalAccounts: Math.floor(currentData.totalAccounts + (Math.random() - 0.5) * 100),
      revenueThisMonth: Math.floor(currentData.revenueThisMonth + (Math.random() - 0.5) * 5000),
      totalSalesThisMonth: Math.floor(currentData.totalSalesThisMonth + (Math.random() - 0.5) * 20),
      totalOrdersThisMonth: Math.floor(currentData.totalOrdersThisMonth + (Math.random() - 0.5) * 30),
      trends: {
        accounts: Number((Math.random() * 20 - 5).toFixed(1)),
        revenue: Number((Math.random() * 25 - 5).toFixed(1)),
        sales: Number((Math.random() * 15 - 3).toFixed(1)),
        orders: Number((Math.random() * 18 - 4).toFixed(1))
      }
    };
    this.cardDataSubject.next(newData);
  }
}
