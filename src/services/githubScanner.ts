import { Octokit } from 'octokit';
import { supabaseAdmin } from '../config/supabase';
import { detectSqlInjection } from '../detectors/sqlInjection';
import { detectExposedKeys } from '../detectors/exposedKeys';
import { detectBrokenAuth } from '../detectors/brokenAuth';
import { detectIdor } from '../detectors/idor';
import { detectRateLimiting } from '../detectors/rateLimitDetector';
import { Vulnerability, DetectorResult } from '../types';
import { VulnerabilityValidator } from './vulnerabilityValidator';

const TARGET_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.py', '.env', '.json', '.yaml', '.yml', '.php', '.rb'];
const GLOBAL_IGNORE_PATHS = ['canvaskit/', 'three.js', 'three.min.js', 'pixi.js', 'chart.js', 'lodash', 'jquery', 'bootstrap'];

export class GitHubScannerService {
  private octokit: Octokit | null = null;
  private validator = new VulnerabilityValidator();

  private getOctokit() {
    if (!this.octokit) {
      this.octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
      });
    }
    return this.octokit;
  }

  async runScan(scanId: string, repoUrl: string, userId: string | null) {
    const octokit = this.getOctokit();
    try {
      console.log(`[SCANNER] Job started for Scan ID: ${scanId} | Repo: ${repoUrl}`);
      await supabaseAdmin.from('scans').update({ status: 'scanning' }).eq('id', scanId);

      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) throw new Error('Invalid GitHub URL structure');
      
      const owner = match[1];
      const repoName = match[2].split(/[?#\/]/)[0].replace(/\.git$/, '');

      // 1. Fetch User Whitelist (Ignored Paths)
      const { data: ignored } = await supabaseAdmin
        .from('ignored_paths')
        .select('file_path')
        .eq('user_id', userId)
        .eq('repo_url', repoUrl);
      
      const userWhitelistedPaths = new Set(ignored?.map(i => i.file_path) || []);

      const repoInfo = await octokit.rest.repos.get({ owner, repo: repoName });
      const defaultBranch = repoInfo.data.default_branch;

      const branchInfo = await octokit.rest.repos.getBranch({
        owner,
        repo: repoName,
        branch: defaultBranch
      });
      const latestSha = branchInfo.data.commit.sha;

      const tree = await octokit.rest.git.getTree({
        owner,
        repo: repoName,
        tree_sha: latestSha,
        recursive: 'true'
      });

      const filesToScan = tree.data.tree.filter((node: any) => 
        node.type === 'blob' && 
        TARGET_EXTENSIONS.some(ext => node.path.endsWith(ext)) &&
        !GLOBAL_IGNORE_PATHS.some(ignore => node.path.toLowerCase().includes(ignore)) &&
        !userWhitelistedPaths.has(node.path)
      );

      const allVulnerabilities: Vulnerability[] = [];

      for (const file of filesToScan) {
        try {
          const fileData = await octokit.rest.repos.getContent({
            owner,
            repo: repoName,
            path: file.path as string
          });

          if ('content' in fileData.data && typeof fileData.data.content === 'string') {
            const content = Buffer.from(fileData.data.content, 'base64').toString('utf-8');
            const filePath = file.path as string;

            const heuristicResults: DetectorResult[] = [
              ...detectSqlInjection(filePath, content),
              ...detectExposedKeys(filePath, content),
              ...detectBrokenAuth(filePath, content),
              ...detectIdor(filePath, content),
              ...detectRateLimiting(filePath, content)
            ];

            // 2. Surgical Validation Pass (AI Pass) - Run concurrently to prevent Vercel/Serverless timeouts
            const validationPromises = heuristicResults.map(async (res) => {
              const snippet = content.split('\n').slice(Math.max(0, res.line_number - 5), res.line_number + 5).join('\n');
              const validation = await this.validator.validateFinding(
                { ...res, file_path: filePath } as any, 
                snippet
              );

              return {
                scan_id: scanId,
                type: res.type,
                severity: res.severity,
                title: res.title,
                description: res.description,
                file_path: filePath,
                line_number: res.line_number,
                general_fix: res.general_fix,
                is_false_positive: !validation.verified,
                verification_reason: validation.reason
              };
            });

            const validatedResults = await Promise.all(validationPromises);
            const verifiedVulnerabilities = validatedResults
              .filter(v => !v.is_false_positive)
              .map(v => {
                const { is_false_positive, verification_reason, ...validDbObject } = v;
                return validDbObject;
              });

            allVulnerabilities.push(...verifiedVulnerabilities);
          }
        } catch (fileErr: any) {
          console.error(`[SCANNER] Failed to read ${file.path}:`, fileErr.message);
        }
      }

      if (allVulnerabilities.length > 0) {
        await supabaseAdmin.from('vulnerabilities').insert(allVulnerabilities);
      }

      await supabaseAdmin.from('scans').update({ status: 'complete' }).eq('id', scanId);
    } catch (error: any) {
      console.error(`[SCANNER] CRITICAL:`, error.message);
      await supabaseAdmin.from('scans').update({ status: 'failed' }).eq('id', scanId);
    }
  }
}
