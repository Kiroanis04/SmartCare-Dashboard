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

// Additional Models for Branch Performance
export interface BranchPerformance {
  branchId: string;
  branchName: string;
  monthlyRevenue: number[];
  monthlySales: number[];
  monthlyOrders: number[];
  growth: number;
}

export interface TimePeriod {
  value: string;
  label: string;
  months: number;
}

// Chart Data Models
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor?: string;
  }[];
}
