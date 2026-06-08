import axiosInstance from '../utils/axios';
import {
  DashboardResponse,
  DealsListResponse,
  DealDetailResponse,
  LeaderboardResponse,
  PerformanceStatsResponse,
  AccountsListResponse,
  AccountAnalyticsResponse,
  AlertsResponse,

  Product,
  Customer,
  Sale,
  ProductsListResponse,
  ProductAnalyticsResponse,
  CustomersListResponse,
  CustomerDetailResponse,
  SalesListResponse,
  SalesSummaryResponse,
  AdminUsersResponse,
  DashboardOverviewResponse
} from '../types';


export const getRevenueOverview = async (): Promise<DashboardResponse> => {
  const res = await axiosInstance.get<DashboardResponse>('/dashboard/revenue');
  return res.data;
};

export const getFullDashboardOverview = async (): Promise<DashboardOverviewResponse> => {
  const res = await axiosInstance.get<DashboardOverviewResponse>('/dashboard/overview');
  return res.data;
};

export const exportRevenueExcel = async (): Promise<Blob> => {
  const res = await axiosInstance.get('/dashboard/revenue/export/excel', {
    responseType: 'blob'
  });
  return res.data;
};

export const exportRevenuePDF = async (): Promise<Blob> => {
  const res = await axiosInstance.get('/dashboard/revenue/export/pdf', {
    responseType: 'blob'
  });
  return res.data;
};


export interface GetDealsParams {
  stage?: string;// ? optional
  search?: string;
  owner?: string;
  page?: number;
  limit?: number;
}

export const getDeals = async (params?: GetDealsParams): Promise<DealsListResponse> => {
  const res = await axiosInstance.get<DealsListResponse>('/deals', { params });
  return res.data;
};

export const getDealById = async (id: string): Promise<DealDetailResponse> => {
  const res = await axiosInstance.get<DealDetailResponse>(`/deals/${id}`);
  return res.data;
};

export const createDeal = async (dealData: {
  title: string;
  value: number;
  stage: string;
  owner: string;
  probability: number;
}): Promise<any> => {
  const res = await axiosInstance.post('/deals', dealData);
  return res.data;
};

export const updateDeal = async (id: string, dealData: Partial<{
  title: string;
  value: number;
  stage: string;
  owner: string;
  probability: number;
}>): Promise<any> => {
  const res = await axiosInstance.put(`/deals/${id}`, dealData);
  return res.data;
};

export const deleteDeal = async (id: string): Promise<any> => {
  const res = await axiosInstance.delete(`/deals/${id}`);
  return res.data;
};


export const getPerformanceStats = async (): Promise<PerformanceStatsResponse> => {
  const res = await axiosInstance.get<PerformanceStatsResponse>('/performance');
  return res.data;
};

export const getLeaderboard = async (): Promise<LeaderboardResponse> => {
  const res = await axiosInstance.get<LeaderboardResponse>('/performance/leaderboard');
  return res.data;
};


export interface GetAccountsParams {
  search?: string;
  industry?: string;
  region?: string;
  churnRisk?: string;
}

export const getAccounts = async (params?: GetAccountsParams): Promise<AccountsListResponse> => {
  const res = await axiosInstance.get<AccountsListResponse>('/accounts', { params });
  return res.data;
};

export const getAccountAnalytics = async (): Promise<AccountAnalyticsResponse> => {
  const res = await axiosInstance.get<AccountAnalyticsResponse>('/accounts/analytics');
  return res.data;
};

export const createAccount = async (accountData: {
  companyName: string;
  industry: string;
  region: string;
  healthScore?: number;
  churnRiskFlag?: boolean;
}): Promise<any> => {
  const res = await axiosInstance.post('/accounts', accountData);
  return res.data;
};


export interface GetProductsParams {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const getProducts = async (params?: GetProductsParams): Promise<ProductsListResponse> => {
  const res = await axiosInstance.get<ProductsListResponse>('/products', { params });
  return res.data;
};

export const getProductAnalytics = async (): Promise<ProductAnalyticsResponse> => {
  const res = await axiosInstance.get<ProductAnalyticsResponse>('/products/analytics');
  return res.data;
};

export const createProduct = async (productData: Partial<Product>): Promise<any> => {
  const res = await axiosInstance.post('/products', productData);
  return res.data;
};

export const updateProduct = async (id: string, productData: Partial<Product>): Promise<any> => {
  const res = await axiosInstance.put(`/products/${id}`, productData);
  return res.data;
};

export const deleteProduct = async (id: string): Promise<any> => {
  const res = await axiosInstance.delete(`/products/${id}`);
  return res.data;
};


export interface GetCustomersParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const getCustomers = async (params?: GetCustomersParams): Promise<CustomersListResponse> => {
  const res = await axiosInstance.get<CustomersListResponse>('/customers', { params });
  return res.data;
};

export const getCustomerById = async (id: string): Promise<CustomerDetailResponse> => {
  const res = await axiosInstance.get<CustomerDetailResponse>(`/customers/${id}`);
  return res.data;
};

export const createCustomer = async (customerData: Partial<Customer>): Promise<any> => {
  const res = await axiosInstance.post('/customers', customerData);
  return res.data;
};

export const updateCustomer = async (id: string, customerData: Partial<Customer>): Promise<any> => {
  const res = await axiosInstance.put(`/customers/${id}`, customerData);
  return res.data;
};

export const deleteCustomer = async (id: string): Promise<any> => {
  const res = await axiosInstance.delete(`/customers/${id}`);
  return res.data;
};

export interface GetSalesParams {
  status?: string;
  page?: number;
  limit?: number;
}

export const getSales = async (params?: GetSalesParams): Promise<SalesListResponse> => {
  const res = await axiosInstance.get<SalesListResponse>('/sales', { params });
  return res.data;
};

export const getSalesSummary = async (): Promise<SalesSummaryResponse> => {
  const res = await axiosInstance.get<SalesSummaryResponse>('/sales/summary');
  return res.data;
};

export const createSale = async (saleData: Partial<Sale> & { customer: string; product: string }): Promise<any> => {
  const res = await axiosInstance.post('/sales', saleData);
  return res.data;
};

export const updateSale = async (id: string, saleData: Partial<Sale>): Promise<any> => {
  const res = await axiosInstance.put(`/sales/${id}`, saleData);
  return res.data;
};

export const deleteSale = async (id: string): Promise<any> => {
  const res = await axiosInstance.delete(`/sales/${id}`);
  return res.data;
};


export const getAdminUsers = async (): Promise<AdminUsersResponse> => {
  const res = await axiosInstance.get<AdminUsersResponse>('/admin/users');
  return res.data;
};

export const updateAdminUserRole = async (id: string, role: string): Promise<any> => {
  const res = await axiosInstance.put(`/admin/users/${id}/role`, { role });
  return res.data;
};

export const toggleAdminUserVerify = async (id: string): Promise<any> => {
  const res = await axiosInstance.put(`/admin/users/${id}/verify`);
  return res.data;
};

export const deleteAdminUser = async (id: string): Promise<any> => {
  const res = await axiosInstance.delete(`/admin/users/${id}`);
  return res.data;
};


export const getAlerts = async (): Promise<AlertsResponse> => {
  const res = await axiosInstance.get<AlertsResponse>('/alerts');
  return res.data;
};

export const markAlertRead = async (alertId: string): Promise<any> => {
  const res = await axiosInstance.post('/alerts/read', { alertId });
  return res.data;
};

export const markAllAlertsRead = async (): Promise<any> => {
  const res = await axiosInstance.post('/alerts/read', { all: true });
  return res.data;
};



export const getSalesRepsList = async (): Promise<any> => {
  const res = await axiosInstance.get<LeaderboardResponse>('/performance/leaderboard');
  return res.data.leaderboard.map(rep => ({
    id: rep.userId,
    name: rep.name,
    email: rep.email,
    role: rep.role
  }));
};

