export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
export type ScanStatus = 'pending' | 'scanning' | 'complete' | 'failed';

export interface Vulnerability {
  id: string;
  scan_id: string;
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
  created_at: string;
  ai_fix?: string | null;
}

export interface ScanResult {
  id?: string;
  scan_id: string;
  repo_url: string;
  repo_name: string;
  score: number;
  status: ScanStatus;
  techStack: string[];
  vulnerabilities: Vulnerability[];
  created_at?: string;
}
