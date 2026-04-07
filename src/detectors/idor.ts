import { DetectorResult } from '../types';

export function detectIdor(filePath: string, content: string): DetectorResult[] {
  const results: DetectorResult[] = [];
  const lines = content.split('\n');

  const idorRegex = /findById\(\s*req\.params\.id\s*\)/i;
  const fetchMissingScopeRegex = /(find|findOne|update|delete|destroy)\(\{.*req\.params\.id.*\}\)/i;

  lines.forEach((line, index) => {
    if (idorRegex.test(line)) {
      results.push({
        type: 'IDOR',
        severity: 'High',
        title: 'Direct Object Reference on ID',
        description: '`req.params.id` is passed directly into a database fetch operation without validating resource ownership.',
        line_number: index + 1,
        general_fix: 'Always verify that the authenticated user actually owns the requested resource before loading or modifying it.'
      });
    }

    if (fetchMissingScopeRegex.test(line)) {
      // Check if user scoping is missing
      if (!line.includes('user_id') && !line.includes('req.user')) {
        results.push({
          type: 'IDOR',
          severity: 'High',
          title: 'Unscoped Object Query',
          description: 'A database query resolving an object ID does not scope the operation to the requesting user.',
          line_number: index + 1,
          general_fix: 'Include a `user_id` parameter matched to the authenticated session context (e.g. `req.user.id`).'
        });
      }
    }
  });

  return results;
}
