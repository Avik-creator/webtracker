// types/analytics.ts

// VisitData represents daily aggregated visit statistics
export interface Visit {
  id?: number;
  analyticsId?: number;
  date: string;
  pageVisits: number;
  visitors: number;
}

// Legacy Visit interface for backward compatibility with visitHistory
export interface VisitRecord {
  timestamp: string;
  visitorId: string;
  sessionId?: string;
  url?: string;
}

export interface RouteAnalytics {
  id: string;
  route: string;
  pageVisits: number;
  visitors: number;
}

export interface SourceAnalytics {
  sourceName: string;
  visitors: number;
}

export interface CountryAnalytics {
  countryCode: string;
  countryName: string;
  visitors: number;
}

export interface DeviceAnalytics {
  deviceType: string;
  visitors: number;
}

export interface OsAnalytics {
  osName: string;
  visitors: number;
}

export interface PerformanceAnalytics {
  domReady: number;
  id: number;
  loadTime: number;
  networkLatency: number;
  processingTime: number;
  totalTime: number;
}

export interface PreviousPeriodData {
  totalPageVisits: number;
  totalVisitors: number;
  avgLoadTime: number;
}

export interface Analytics {
  visitHistory: Visit[];
  routeAnalytics: RouteAnalytics[];
  sourceAnalytics: SourceAnalytics[];
  countryAnalytics: CountryAnalytics[];
  deviceAnalytics: DeviceAnalytics[];
  osAnalytics: OsAnalytics[];
  performanceAnalytics: PerformanceAnalytics[];
  totalPageVisits?: number;
  totalVisitors?: number;
  avgLoadTime?: number;
  previousPeriod?: PreviousPeriodData;
}

export interface AnalyticsData {
  analytics: Analytics;
  success?: boolean;
  message?: string;
}

export interface PieChartData {
  name: string;
  value: number;
}

export interface BarChartData {
  page: string;
  views: number;
}

export interface CountryChartData {
  country: string;
  visitors: number;
}

export interface OsChartData {
  site: string;
  visits: number;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  color: string;
}

export const COLORS = {
  blue: ["#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"],
  green: ["#065f46", "#047857", "#059669", "#10b981", "#34d399"],
  amber: ["#92400e", "#b45309", "#d97706", "#f59e0b", "#fbbf24"],
  purple: ["#5b21b6", "#6d28d9", "#7c3aed", "#8b5cf6", "#a78bfa"],
  yellow: ["#78350f", "#b45309", "#d97706", "#f59e0b", "#fbbf24"],
  red: ["#991b1b", "#dc2626", "#ef4444", "#fca5a1", "#fee2e2"],
  gray: ["#374151", "#4b5563", "#6b7280", "#9ca3af", "#d1d5db"],
  teal: ["#0f766e", "#115e59", "#134e4a", "#164e63", "#1d4ed8"],
  cyan: ["#0e7490", "#0284c7", "#06b6d4", "#22d3ee", "#67e8f9"],
  pink: ["#831843", "#db2777", "#ec4899", "#f472b6", "#f9a8d4"],
  orange: ["#7c2d12", "#c2410c", "#ea580c", "#f97316", "#fdba74"],
  indigo: ["#3730a3", "#4f46e5", "#6366f1", "#818cf8", "#c7d2fe"],
  lime: ["#4d7c0f", "#65a30d", "#84cc16", "#a3e635", "#bbf7d0"],
  emerald: ["#065f46", "#047857", "#059669", "#10b981", "#34d399"],
};

export const PIECHARTCOLORS = [
  "#1d4ed8",
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#3b82f6",
  "#2563eb",
  "#1d4ed8",
  "#1d4ed8",
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#3b82f6",
  "#2563eb",
  "#1d4ed8",
  "#1d4ed8",
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#3b82f6",
  "#2563eb",
  "#1d4ed8",
  "#1d4ed8",
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#3b82f6",
  "#2563eb",
  "#1d4ed8",
];
