// Dashboard Card Models
export interface DashboardCard {
  id: string;
  title: string;
  value: number;
  icon: string;
  iconGradient: string;
  trend: number;
  format: 'number' | 'currency' | 'percentage';
}

export interface CardData {
  totalAccounts: number;
  revenueThisMonth: number;
  totalSalesThisMonth: number;
  totalOrdersThisMonth: number;
  trends: {
    accounts: number;
    revenue: number;
    sales: number;
    orders: number;
  };
}

export interface LowStockItem {
  productId: string;
  productName: string;
  storeId: string;
  storeName: string;       // ← mapped to branchName in component
  currentStock: number;
  threshold: number;
}

export interface LowStockApiResponse {
  statusCode: number;
  succeeded: boolean;
  message: string;
  errorsBag: any;
  data: {
    items: LowStockItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Admin Profile Models
export interface AdminProfile {
  id: string;
  username: string;
  email: string;
  avatar: string;
  role: string;
  lastLogin: Date;
  permissions: string[];
}

// Branch Data Models
export interface BranchData {
  name: string;
  revenue: number;
  sales: number;
  orders: number;
  color: string;
}

// Date Range Model
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Category Data Model for Donut Chart
// Add this to your existing dashboard.model.ts

export interface CategoryData {
  name: string;
  value: number;
  color: string;
  percentage?: number;
  growth?: number;
  icon?: string;
}


export interface LowStockItem {
  productName: string;
  branchName: string;
  currentStock: number;
  threshold: number;
  status: 'critical' | 'warning' | 'low' | 'normal';
}

export interface StockStatus {
  color: string;
  label: string;
  icon: string;
}
