export interface ErrorResponse {
  status: number;
  error: string;
  code?: string;
  params?: string[];
  timestamp: string;
}
