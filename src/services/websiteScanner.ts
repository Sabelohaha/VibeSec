import tls from 'tls';
import axios from 'axios';
import dns from 'dns/promises';
import { Vulnerability } from '../types';

export class WebsiteScannerService {
  async runAudit(url: string): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = [];
    const domain = new URL(url).hostname;

    try {
      // 1. SSL Audit
      const sslResult = await this.checkSSL(domain);
      if (sslResult) vulnerabilities.push(...sslResult);

      // 2. Header Audit
      const headerResult = await this.checkHeaders(url);
      if (headerResult) vulnerabilities.push(...headerResult);

      // 3. DNS Security Audit
      const dnsResult = await this.checkDNS(domain);
      if (dnsResult) vulnerabilities.push(...dnsResult);

      // 4. Well-Known Files Audit
      const fileResult = await this.checkWellKnown(url);
      if (fileResult) vulnerabilities.push(...fileResult);

    } catch (err) {
      console.error(`[WEB_SCANNER] Audit failed for ${url}:`, err);
    }

    return vulnerabilities;
  }

  private async checkSSL(domain: string): Promise<Vulnerability[]> {
    return new Promise((resolve) => {
      const socket = tls.connect(443, domain, { servername: domain }, () => {
        const cert = socket.getPeerCertificate();
        const results: Vulnerability[] = [];

        if (!cert || Object.keys(cert).length === 0) {
          results.push({
            type: 'SSL Certificate',
            severity: 'Critical',
            title: 'No SSL Certificate Found',
            description: 'The website does not provide a valid SSL/TLS certificate.',
            file_path: 'Network',
            line_number: 0,
            general_fix: 'Install a valid SSL certificate (e.g., via Let\'s Encrypt).'
          });
        } else {
          const daysRemaining = (new Date(cert.valid_to).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
          if (daysRemaining < 30) {
            results.push({
              type: 'SSL Certificate',
              severity: 'High',
              title: 'SSL Certificate Expiring Soon',
              description: `The SSL certificate for ${domain} expires in ${Math.floor(daysRemaining)} days.`,
              file_path: 'Network',
              line_number: 0,
              general_fix: 'Renew the SSL certificate immediately.'
            });
          }
        }
        socket.end();
        resolve(results);
      });

      socket.on('error', (err) => {
        resolve([{
          type: 'SSL Certificate',
          severity: 'Critical',
          title: 'SSL Handshake Failed',
          description: `Failed to establish a secure connection: ${err.message}`,
          file_path: 'Network',
          line_number: 0,
          general_fix: 'Verify your SSL configuration and certificate validity.'
        }]);
      });
    });
  }

  private async checkHeaders(url: string): Promise<Vulnerability[]> {
    const results: Vulnerability[] = [];
    try {
      const response = await axios.get(url, { timeout: 5000 });
      const headers = response.headers;

      const securityHeaders = [
        { name: 'content-security-policy', title: 'Missing Content-Security-Policy (CSP)' },
        { name: 'strict-transport-security', title: 'Missing Strict-Transport-Security (HSTS)' },
        { name: 'x-frame-options', title: 'Missing X-Frame-Options (Clickjacking protection)' },
        { name: 'x-content-type-options', title: 'Missing X-Content-Type-Options' }
      ];

      securityHeaders.forEach(sh => {
        if (!headers[sh.name]) {
          results.push({
            type: 'Security Headers',
            severity: 'Medium',
            title: sh.title,
            description: 'The server is missing a critical security header that protects against common attacks like XSS and Clickjacking.',
            file_path: 'HTTP Headers',
            line_number: 0,
            general_fix: `Add the ${sh.name.toUpperCase()} header to your server's responses.`
          });
        }
      });
    } catch (err) {
      // Ignore network errors for header checks as SSL audit handles them
    }
    return results;
  }

  private async checkDNS(domain: string): Promise<Vulnerability[]> {
    const results: Vulnerability[] = [];
    try {
      const caa = await dns.resolveCaa(domain).catch(() => []);
      if (caa.length === 0) {
        results.push({
          type: 'DNS Security',
          severity: 'Low',
          title: 'Missing CAA Record',
          description: 'A Certificate Authority Authorization (CAA) record is not set, which allows any CA to issue a certificate for this domain.',
          file_path: 'DNS',
          line_number: 0,
          general_fix: 'Add a CAA record to your DNS settings to restrict which CAs can issue certificates for your domain.'
        });
      }
    } catch (err) {
      // Ignore DNS errors
    }
    return results;
  }

  private async checkWellKnown(url: string): Promise<Vulnerability[]> {
    const results: Vulnerability[] = [];
    const domain = new URL(url).origin;
    try {
      await axios.get(`${domain}/.well-known/security.txt`, { timeout: 2000 }).catch(e => {
        if (e.response?.status !== 200) {
          results.push({
            type: 'Responsible Disclosure',
            severity: 'Low',
            title: 'Missing security.txt',
            description: 'The website does not have a security.txt file, which makes it harder for researchers to report security issues responsibly.',
            file_path: '/.well-known/security.txt',
            line_number: 0,
            general_fix: 'Create and host a security.txt file following the RFC 9116 standard.'
          });
        }
      });
    } catch (err) {
      // Ignore errors
    }
    return results;
  }
}
