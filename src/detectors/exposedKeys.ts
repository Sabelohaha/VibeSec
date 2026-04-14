import { DetectorResult } from '../types';

export function detectExposedKeys(filePath: string, content: string): DetectorResult[] {
  const results: DetectorResult[] = [];
  const lines = content.split('\n');

  if (filePath.endsWith('.env')) {
    results.push({
      type: 'Exposed Secrets',
      severity: 'High',
      title: 'Committed .env File',
      description: 'The .env file contains secrets and should not be committed to source control.',
      line_number: 1,
      general_fix: 'Remove the .env file from the repository, rotate the secrets, and add .env to .gitignore.'
    });
  }

  const secretAssignmentPatterns = [
    /SUPABASE_KEY\s*[:=]\s*['"][^'"]+['"]/i,
    /sk_live_[a-zA-Z0-9_]{20,}/, // Stripe Live
    /sk_test_[a-zA-Z0-9_]{20,}/, // Stripe Test
    /AKIA[0-9A-Z]{16}/,           // AWS Access Key ID
    /(?:SECRET|ACCESS|PASS|AUTH|TOKEN|KEY|PWD|CREDENTIALS).{0,20}[:=]\s*['"][a-zA-Z0-9_/+]{20,}['"]/i, // Generic assignment
    /Bearer\s+[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+/, // JWT
    /AC[a-z0-9]{32}/,             // Twilio Account SID
    /SG\.[a-zA-Z0-9_\-\.]{64}/,   // SendGrid API Key
    /AIza[0-9A-Za-z-_]{35}/       // Google API Key
  ];

  const devLoginPatterns = [
    /['"]?(?:email|user|username|DEV_TEST_EMAIL)['"]?\s*(?:[:=]|==|===)\s*['"](?:dev|test|admin|demo|admin@vibesec.local)@?[\w.-]*['"]/i, // Hardcoded dev/test email
    /['"]?(?:password|pwd|DEV_TEST_PASS)['"]?\s*(?:[:=]|==|===)\s*['"](?:password|test|admin|admin123|srmcbj@3|123456)['"]/i, // Hardcoded common/weak/dev passwords
    /srmcbj@3/ // The specific dev pass
  ];

  lines.forEach((line, index) => {
    // Ignore generic placeholder strings
    if (line.toLowerCase().includes('your_') || line.toLowerCase().includes('example')) return;

    let found = false;

    for (const pattern of secretAssignmentPatterns) {
      if (pattern.test(line)) {
        results.push({
          type: 'Exposed Secrets',
          severity: 'Critical',
          title: 'Hardcoded API Key Detection',
          description: 'A hardcoded secret or API key was found in the source code.',
          line_number: index + 1,
          general_fix: 'Remove the hardcoded secret, rotate it, and use environment variables for sensitive configurations.'
        });
        found = true;
        break;
      }
    }

    if (found) return;

    for (const pattern of devLoginPatterns) {
      if (pattern.test(line)) {
        results.push({
          type: 'Authentication Flaw',
          severity: 'High',
          title: 'Exposed Dev Login Credential',
          description: 'A hardcoded developer login or test credential was found. Attackers can use this to bypass authentication.',
          line_number: index + 1,
          general_fix: 'Remove hardcoded test credentials. Dynamically seed test databases or use temporary injected environment variables in test scopes.'
        });
        break;
      }
    }
  });

  return results;
}
