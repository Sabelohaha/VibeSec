import { DetectorResult } from '../types';

export function detectBrokenAuth(filePath: string, content: string): DetectorResult[] {
  const results: DetectorResult[] = [];
  const lines = content.split('\n');

  const missingJwtRegex = /router\.(get|post|put|delete|patch)\(['"]\/(admin|dashboard|profile|settings|users)['"],\s*(async\s+)?\(req,\s*res\)/i;
  const hardcodedCredentialsRegex = /(username|password|admin)\s*[:=]\s*['"](admin|password123|123456)['"]/i;
  const localStorageTokenRegex = /localStorage\.setItem\(['"](token|jwt|access_token|session)['"],/i;

  lines.forEach((line, index) => {
    if (missingJwtRegex.test(line)) {
      results.push({
        type: 'Broken Authentication',
        severity: 'High',
        title: 'Missing Authentication Middleware',
        description: 'A protected route was declared without JWT/authentication middleware logic.',
        line_number: index + 1,
        general_fix: 'Add authentication middleware (e.g., `authMiddleware`) before the route handler to secure the endpoint.'
      });
    }

    if (hardcodedCredentialsRegex.test(line)) {
      results.push({
        type: 'Broken Authentication',
        severity: 'Critical',
        title: 'Hardcoded Authentication Credentials',
        description: 'Hardcoded system credentials make it extremely easy for attackers to compromise the environment.',
        line_number: index + 1,
        general_fix: 'Implement a proper authentication system connected to a secure database and remove hardcoded credentials.'
      });
    }

    if (localStorageTokenRegex.test(line)) {
      results.push({
        type: 'Broken Authentication',
        severity: 'Medium',
        title: 'Insecure Token Storage',
        description: 'Tokens stored directly in localStorage are vulnerable to XSS attacks.',
        line_number: index + 1,
        general_fix: 'Consider using secure HttpOnly cookies for session storage to mitigate XSS risks.'
      });
    }
  });

  return results;
}
