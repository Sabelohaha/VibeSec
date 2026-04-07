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
    /SUPABASE_KEY\s*=\s*['"][^'"]+['"]/i,
    /sk-[a-zA-Z0-9]{32,}/,
    /Bearer\s+[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+/,
    /api_key\s*=\s*['"][^'"]+['"]/i,
    /apiKey:\s*['"][^'"]+['"]/i,
    /SECRET\s*=\s*['"][^'"]+['"]/i,
    /PASSWORD\s*=\s*['"][^'"]+['"]/i
  ];

  lines.forEach((line, index) => {
    // Ignore generic placeholder strings
    if (line.toLowerCase().includes('your_') || line.toLowerCase().includes('example')) return;

    for (const pattern of secretAssignmentPatterns) {
      if (pattern.test(line)) {
        results.push({
          type: 'Exposed Secrets',
          severity: 'Critical',
          title: 'Hardcoded Secret Detection',
          description: 'A hardcoded secret or API key was found in the source code.',
          line_number: index + 1,
          general_fix: 'Remove the hardcoded secret, rotate it, and use environment variables for sensitive configurations.'
        });
        break;
      }
    }
  });

  return results;
}
