export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
export type ScanStatus = 'pending' | 'scanning' | 'complete' | 'failed';

export interface Scan {
  id: string;
  user_id: string | null;
  repo_url: string;
  repo_name: string;
  status: ScanStatus;
  created_at: string;
}

export interface Vulnerability {
  id?: string;
  scan_id?: string;
  type: string;
  severity: Severity;
  title: string;
  description: string;
  file_path: string;
  line_number: number;
  general_fix?: string;
  is_false_positive?: boolean;
  is_ignored?: boolean;
  verification_reason?: string;
  created_at?: string;
  ai_fix?: string | null;
}

export interface AIFix {
  id: string;
  user_id: string;
  vulnerability_id: string;
  response_markdown: string;
  created_at: string;
}

export interface AIFixUsage {
  id: string;
  user_id: string;
  monthly_count: number;
  last_reset: string;
  created_at: string;
}

export interface DetectorResult {
  type: string;
  severity: Severity;
  title: string;
  description: string;
  line_number: number;
  general_fix?: string;
}
