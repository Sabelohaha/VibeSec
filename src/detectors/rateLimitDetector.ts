import { DetectorResult } from '../types';

export function detectRateLimiting(filePath: string, content: string): DetectorResult[] {
  const results: DetectorResult[] = [];
  const lines = content.split('\n');

  const authRouteRegex = /app\.(post|put)\(['"]\/(login|register|reset)['"],\s*(async\s+)?\(req/i;
  let hasRateLimitImport = false;

  lines.forEach(line => {
    if (line.includes('express-rate-limit')) {
      hasRateLimitImport = true;
    }
  });

  lines.forEach((line, index) => {
    if (authRouteRegex.test(line) && !line.includes('rateLimit') && !hasRateLimitImport) {
      results.push({
        type: 'Missing Rate Limiting',
        severity: 'Medium',
        title: 'Unprotected Sensitive Route',
        description: 'Authentication or sensitive routes without rate limits are susceptible to brute forcing and credential stuffing.',
        line_number: index + 1,
        general_fix: 'Implement an express-rate-limit middleware directly on this route to block excessive requests.'
      });
    }
  });

  return results;
}
