export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee' | 'rep';
  department?: string;
  avatar?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}


export type DealStage = 'Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';

export interface Deal {
  _id: string;
  title: string;
  value: number;
  stage: DealStage;
  owner: User;
  probability: number;
  lastActivityDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  _id: string;
  companyName: string;
  industry: string;
  region: string;
  healthScore: number;
  churnRiskFlag: boolean;
  revenue?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type AlertType = 'info' | 'warning' | 'success' | 'danger';

export interface Alert {
  _id: string;
  message: string;
  type: AlertType;
  isRead: boolean;
  createdAt: string;
}

export interface Activity {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
  dealId?: string;
  type: 'deal_created' | 'stage_change' | 'meeting' | 'call' | 'email' | 'note' | 'custom';
  description: string;
  createdAt: string;
}

export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  arr: number;
  growthPercentage: number;
}

export interface RevenueTrendItem {
  month: string;
  revenue: number;
  dealsCount: number;
}

export interface RevenueBreakdownItem {
  stage: string;
  value: number;
  count: number;
}

export interface DashboardResponse {
  success: boolean;
  metrics: RevenueMetrics;
  trend: RevenueTrendItem[];
  breakdown: RevenueBreakdownItem[];
}

export interface PerformanceStats {
  totalRevenue: number;
  pipelineValue: number;
  totalDeals: number;
  closedWonCount: number;
  closedLostCount: number;
  averageWinRate: number;
}

export interface LeaderboardRep {
  userId: string;
  name: string;
  email: string;
  role: string;
  revenueGenerated: number;
  dealsCount: number;
  closedWonCount: number;
  closedLostCount: number;
  winRate: number;
  activitiesCount: number;
}

export interface LeaderboardResponse {
  success: boolean;
  leaderboard: LeaderboardRep[];
}

export interface PerformanceStatsResponse {
  success: boolean;
  stats: PerformanceStats;
}

export interface IndustryRevenue {
  industry: string;
  revenue: number;
}

export interface RegionRevenue {
  region: string;
  revenue: number;
}

export interface HealthSummary {
  totalAccounts: number;
  averageHealth: number;
  churnRiskCount: number;
  healthyCount: number;
}

export interface AccountAnalyticsResponse {
  success: boolean;
  analytics: {
    revenueByIndustry: IndustryRevenue[];
    revenueByRegion: RegionRevenue[];
    topCustomers: Account[];
    healthSummary: HealthSummary;
  };
}

export interface AccountsListResponse {
  success: boolean;
  count: number;
  accounts: Account[];
}

export interface DealsListResponse {
  success: boolean;
  count: number;
  totalPages: number;
  currentPage: number;
  totalDeals: number;
  deals: Deal[];
}

export interface DealDetailResponse {
  success: boolean;
  deal: Deal;
  activities: Activity[];
}

export interface AlertsResponse {
  success: boolean;
  count: number;
  unreadCount: number;
  alerts: Alert[];
}

// ─── New Enterprise Entities ──────────────────────────────────────
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: 'Software' | 'Hardware' | 'Service' | 'Subscription' | 'Consulting' | 'Other';
  sku?: string;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  unitsSold: number;
  revenue: number;
  createdAt?: string;
}

export interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'active' | 'inactive' | 'lead' | 'churned';
  totalSpend: number;
  tags: string[];
  city?: string;
  country?: string;
  notes?: string;
  assignedTo?: {
    _id: string;
    name: string;
  };
  createdAt?: string;
}

export interface Sale {
  _id: string;
  saleNumber: string;
  customer: Customer;
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  saleDate: string;
  salesperson?: {
    _id: string;
    name: string;
  };
  notes?: string;
  paymentMethod: 'credit_card' | 'bank_transfer' | 'cash' | 'check' | 'other';
  createdAt?: string;
}

// ─── New Responses ────────────────────────────────────────────────
export interface ProductAnalytics {
  totalProducts: number;
  activeProducts: number;
  totalRevenue: number;
  totalUnitsSold: number;
  outOfStock: number;
  categoryBreakdown: { category: string; count: number; revenue: number }[];
  topProducts: Product[];
}

export interface ProductAnalyticsResponse {
  success: boolean;
  analytics: ProductAnalytics;
}

export interface ProductsListResponse {
  success: boolean;
  count: number;
  totalProducts: number;
  totalPages: number;
  currentPage: number;
  products: Product[];
}

export interface CustomersListResponse {
  success: boolean;
  count: number;
  totalCustomers: number;
  totalPages: number;
  currentPage: number;
  customers: Customer[];
}

export interface CustomerDetailResponse {
  success: boolean;
  customer: Customer;
  recentSales: Sale[];
}

export interface SalesListResponse {
  success: boolean;
  count: number;
  totalSales: number;
  totalPages: number;
  currentPage: number;
  sales: Sale[];
}

export interface SalesSummary {
  totalSales: number;
  totalRevenue: number;
  monthlyRevenue: number;
  growthRate: number;
  trend: { month: string; revenue: number; count: number }[];
}

export interface SalesSummaryResponse {
  success: boolean;
  summary: SalesSummary;
}

export interface AdminUsersResponse {
  success: boolean;
  count: number;
  users: User[];
}

export interface DashboardOverviewResponse {
  success: boolean;
  metrics: {
    totalCustomers: number;
    activeCustomers: number;
    totalProducts: number;
    activeProducts: number;
    totalSales: number;
    completedSalesCount: number;
    totalRevenue: number;
    currentMonthRevenue: number;
    revenueGrowth: number;
  };
  charts: {
    daily: { label: string; revenue: number; salesCount: number }[];
    weekly: { label: string; revenue: number; salesCount: number }[];
    monthly: { label: string; revenue: number; salesCount: number }[];
    yearly: { label: string; revenue: number; salesCount: number }[];
  };
  topSellingProducts: { name: string; quantity: number; revenue: number }[];
  recentSales: {
    id: string;
    customerName: string;
    customerCompany: string;
    productName: string;
    amount: number;
    quantity: number;
    saleDate: string;
  }[];
}

