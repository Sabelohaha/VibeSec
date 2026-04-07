import { DetectorResult } from '../types';

export function detectSqlInjection(filePath: string, content: string): DetectorResult[] {
  const results: DetectorResult[] = [];
  const lines = content.split('\n');

  const concatQueryRegex = /(query|execute|run|exec|sql|raw)\s*\([^)]*\+/i;
  const dbExecuteConcatRegex = /db\.(?:execute|query|raw|run)\s*\([^)]*\+/i;
  const unparameterizedWhereRegex = /WHERE.*=.*\+/i;
  const templateLiteralSqlRegex = /[\`].*(SELECT|INSERT|UPDATE|DELETE|WHERE).*[\$]\{.*\}.*[\`]/is;
  const sequelizeRawRegex = /sequelize\.query\s*\(\s*[\`].*[\$]\{.*\}.*[\`]/i;

  lines.forEach((line, index) => {
    if (concatQueryRegex.test(line) || dbExecuteConcatRegex.test(line) || unparameterizedWhereRegex.test(line) || templateLiteralSqlRegex.test(line)) {
      results.push({
        type: 'SQL Injection',
        severity: 'Critical',
        title: 'Raw string concatenation in SQL query',
        description: 'Building SQL queries using raw string concatenation or template literals leaves the application extremely vulnerable to SQL injection attacks.',
        line_number: index + 1,
        general_fix: 'Use parameterized queries or an ORM that automatically handles parameter binding instead of string concatenation.'
      });
    }
  });

  return results;
}
