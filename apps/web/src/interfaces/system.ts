export interface ServiceHealth {
  service: string;
  status: 'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN';
  uptime?: number;
  memoryUsage?: number;
  cpuUsage?: number;
  responseTime?: number;
  details?: Record<string, any>;
  lastChecked: string;
}

export interface SystemStatus {
  overall: 'UP' | 'DOWN' | 'DEGRADED';
  services: ServiceHealth[];
  timestamp: string;
}

export interface ServiceMetrics {
  service: string;
  metrics: {
    requestCount: number;
    errorCount: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
  };
  timeframe: '1h' | '24h' | '7d' | '30d';
  timestamp: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug' | 'verbose';
  service: string;
  message: string;
  context?: string;
  traceId?: string;
  metadata?: Record<string, any>;
}

export interface LogSearchParams {
  level?: 'error' | 'warn' | 'info' | 'debug' | 'verbose';
  service?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface LogSearchResult {
  logs: LogEntry[];
  totalCount: number;
}

export interface AlertRule {
  id: string;
  name: string;
  description?: string;
  condition: string;
  threshold: number;
  service: string;
  metric: string;
  duration: number;
  severity: 'critical' | 'error' | 'warning' | 'info';
  enabled: boolean;
  notificationChannels: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  ruleId: string;
  rule?: AlertRule;
  status: 'firing' | 'resolved' | 'acknowledged';
  value: number;
  message: string;
  service: string;
  startedAt: string;
  resolvedAt?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
} 