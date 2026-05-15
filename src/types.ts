export interface Product {
  id: string;
  name: string;
  sales: number;
  trend: string;
  stock: number;
  status: string;
  health: number;
}

export interface ShopMetrics {
  revenue: number;
  visitors: number;
  cr: number; // Conversion Rate
  orders: number;
  avgOrderValue: number;
  topProducts: Product[];
  ctr?: number;
  negativeReviewRate?: number;
}

export interface OptimizationAction {
  id: string;
  type: 'title' | 'description' | 'image' | 'price' | 'shipping';
  severity: 'low' | 'medium' | 'high';
  issue: string;
  suggestion: string;
  reason: string;
  originalValue: string;
  suggestedValue: string;
  status: 'pending' | 'applied' | 'error';
  storeName: string;
  region: string;
  linkId: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface DiagnosticResult {
  summary: string;
  actions: OptimizationAction[];
  overallHealth: number; // 0-100
}
