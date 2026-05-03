import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { CardData, AdminProfile, BranchData, DateRange, CategoryData, LowStockApiResponse } from '../Models/dashboard.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = 'https://smartcarepharmacy.tryasp.net';
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
    username: 'Kyrillos Anis',
    email: 'Kyrillos.Anis@admin.com',
    avatar: 'https://ui-avatars.com/api/?background=3b82f6&color=fff&rounded=true&size=80&bold=true&name=Alex&length=2',
    role: 'Administrator',
    lastLogin: new Date(),
    permissions: ['read', 'write', 'delete', 'manage_users']
  });

  // Category Data
  private categoryData: CategoryData[] = [
    {
      name: 'Electronics',
      value: 4250000,
      color: '#3b82f6',
      growth: 15.3,
      icon: '📱'
    },
    {
      name: 'Clothing',
      value: 2850000,
      color: '#10b981',
      growth: 8.7,
      icon: '👕'
    },
    {
      name: 'Food & Beverage',
      value: 1980000,
      color: '#f59e0b',
      growth: 12.1,
      icon: '🍔'
    },
    {
      name: 'Furniture',
      value: 1560000,
      color: '#8b5cf6',
      growth: 5.4,
      icon: '🛋️'
    },
    {
      name: 'Books',
      value: 890000,
      color: '#ec489a',
      growth: -2.3,
      icon: '📚'
    },
    {
      name: 'Sports',
      value: 670000,
      color: '#06b6d4',
      growth: 22.8,
      icon: '⚽'
    },
    {
      name: 'Beauty',
      value: 450000,
      color: '#f43f5e',
      growth: 18.5,
      icon: '💄'
    },
    {
      name: 'Toys',
      value: 340000,
      color: '#14b8a6',
      growth: 6.2,
      icon: '🧸'
    }
  ];

  // Branch Data Cache
  private branchDataCache: Map<string, BranchData[]> = new Map();

  constructor(private httpclient: HttpClient) {
    this.initializeBranchData();
    this.calculateCategoryPercentages();
  }

  private calculateCategoryPercentages() {
    const total = this.categoryData.reduce((sum, cat) => sum + cat.value, 0);
    this.categoryData.forEach(cat => {
      cat.percentage = (cat.value / total) * 100;
    });
  }

  private initializeBranchData() {
    // Current Month Data
    const currentMonthData: BranchData[] = [
      { name: 'Cairo Branch', revenue: 1250000, sales: 800000, orders: 3420, color: '#3b82f6' },
      { name: 'Alex Branch', revenue: 980000, sales: 750000, orders: 2780, color: '#10b981' },
      { name: 'Giza Branch', revenue: 750000, sales: 600000, orders: 2150, color: '#f59e0b' },
      { name: 'Port Said', revenue: 520000, sales: 420000, orders: 1450, color: '#8b5cf6' },
      { name: 'Ismailia', revenue: 380000, sales: 310000, orders: 1080, color: '#ec489a' },
      { name: 'Luxor Branch', revenue: 290000, sales: 230000, orders: 890, color: '#06b6d4' }
    ];

    // Last Month Data
    const lastMonthData: BranchData[] = [
      { name: 'Cairo Branch', revenue: 1180000, sales: 750000, orders: 3250, color: '#3b82f6' },
      { name: 'Alex Branch', revenue: 920000, sales: 700000, orders: 2650, color: '#10b981' },
      { name: 'Giza Branch', revenue: 710000, sales: 560000, orders: 2050, color: '#f59e0b' },
      { name: 'Port Said', revenue: 490000, sales: 390000, orders: 1380, color: '#8b5cf6' },
      { name: 'Ismailia', revenue: 360000, sales: 290000, orders: 1020, color: '#ec489a' },
      { name: 'Luxor Branch', revenue: 275000, sales: 220000, orders: 850, color: '#06b6d4' }
    ];

    this.branchDataCache.set('current', currentMonthData);
    this.branchDataCache.set('lastMonth', lastMonthData);
    this.branchDataCache.set('last3Months', lastMonthData);
    this.branchDataCache.set('last6Months', lastMonthData);
    this.branchDataCache.set('lastYear', lastMonthData);
  }

  // Get Category Distribution Data
  getCategoryDistribution(): Observable<CategoryData[]> {
    return of([...this.categoryData]).pipe(delay(300));
  }

  // Get Category Data with filters (by date range)
  getCategoryDistributionByDateRange(dateRange: DateRange): Observable<CategoryData[]> {
    const startDate = new Date(dateRange.startDate);
    const currentDate = new Date();
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    let filteredData = [...this.categoryData];

    if (startDate < currentMonthStart) {
      // Return reduced data for past periods (85% of current)
      filteredData = this.categoryData.map(cat => ({
        ...cat,
        value: cat.value * 0.85
      }));
      const total = filteredData.reduce((sum, cat) => sum + cat.value, 0);
      filteredData.forEach(cat => {
        cat.percentage = (cat.value / total) * 100;
      });
    }

    return of(filteredData).pipe(delay(300));
  }

  // Get Category Statistics
  getCategoryStatistics(): Observable<{
    totalSales: number;
    averagePerCategory: number;
    topCategory: CategoryData | null;
    fastestGrowing: CategoryData | null;
    categories: CategoryData[];
  }> {
    const totalSales = this.categoryData.reduce((sum, cat) => sum + cat.value, 0);
    const averagePerCategory = totalSales / this.categoryData.length;
    const topCategory = [...this.categoryData].sort((a, b) => b.value - a.value)[0];
    const fastestGrowing = [...this.categoryData].sort((a, b) => (b.growth || 0) - (a.growth || 0))[0];

    return of({
      totalSales,
      averagePerCategory,
      topCategory,
      fastestGrowing,
      categories: this.categoryData
    }).pipe(delay(200));
  }

  // Get Category Performance Over Time - FIXED TYPE ERROR
  getCategoryPerformance(categoryName: string): Observable<{
    monthlyData: number[];
    growth: number;
    trend: 'up' | 'down' | 'stable';
  }> {
    // Simulate monthly data for the selected category
    const category = this.categoryData.find(c => c.name === categoryName);
    const monthlyData = [
      (category?.value || 0) * 0.7,
      (category?.value || 0) * 0.75,
      (category?.value || 0) * 0.8,
      (category?.value || 0) * 0.85,
      (category?.value || 0) * 0.9,
      (category?.value || 0) * 0.95,
      category?.value || 0
    ];

    const growth = category?.growth || 0;
    // Explicitly type the trend as the union type
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (growth > 0) {
      trend = 'up';
    } else if (growth < 0) {
      trend = 'down';
    }

    return of({ monthlyData, growth, trend }).pipe(delay(200));
  }

  // Public Observables
  getCardData(): Observable<CardData> {
    return this.cardDataSubject.asObservable();
  }

 getUsers(): Observable<any> {
  return this.httpclient.get<any>("https://smartcarepharmacy.tryasp.net/api/admin/analytics/clients");
}

getSummer(): Observable<any>{
  return this.httpclient.get<any>("https://smartcarepharmacy.tryasp.net/api/admin/analytics/summary");
}

getCompanies(): Observable<any>{
  return this.httpclient.get<any>("https://smartcarepharmacy.tryasp.net/api/admin/analytics/companies");
}

getCategories(): Observable<any>{
  return this.httpclient.get<any>("https://smartcarepharmacy.tryasp.net/api/admin/analytics/categories");
}

 getLowStock(pageNumber: number, pageSize: number, threshold?: number, storeId?: string): Observable<LowStockApiResponse> {
  let url = `${this.baseUrl}/api/admin/dashboard/stores-Low-stock?PageNumber=${pageNumber}&PageSize=${pageSize}`;
  if (threshold != null && threshold > 0) url += `&Threshold=${threshold}`;
  if (storeId && storeId !== 'all') url += `&StoreId=${storeId}`;
  return this.httpclient.get<LowStockApiResponse>(url);
}

  getAdminProfile(): Observable<AdminProfile> {
    return this.adminProfileSubject.asObservable();
  }

  getCurrentCardData(): CardData {
    return this.cardDataSubject.value;
  }

  getCurrentAdminProfile(): AdminProfile {
    return this.adminProfileSubject.value;
  }

  updateCardData(data: Partial<CardData>) {
    const currentData = this.cardDataSubject.value;
    this.cardDataSubject.next({ ...currentData, ...data });
  }

  updateAdminProfile(profile: Partial<AdminProfile>) {
    const currentProfile = this.adminProfileSubject.value;
    this.adminProfileSubject.next({ ...currentProfile, ...profile });
  }

  getBranchDataByDateRange(dateRange: DateRange): Observable<BranchData[]> {
    return of(this.calculateBranchDataForDateRange(dateRange));
  }

  private calculateBranchDataForDateRange(dateRange: DateRange): BranchData[] {
    const startDate = new Date(dateRange.startDate);
    const currentDate = new Date();
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    if (startDate >= currentMonthStart) {
      return this.branchDataCache.get('current') || [];
    } else {
      return this.branchDataCache.get('lastMonth') || [];
    }
  }

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
