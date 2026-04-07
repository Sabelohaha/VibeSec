import axios from 'axios';
import { supabase } from './supabase';
import type { ScanResult } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export const submitScan = async (repoUrl: string): Promise<{ scan_id: string; status: string }> => {
  const response = await api.post('/api/scan', { repo_url: repoUrl });
  return response.data;
};

export const pollScan = async (scanId: string): Promise<ScanResult> => {
  const response = await api.get(`/api/scan/${scanId}`);
  return response.data;
};

export const getAiFix = async (vulnerabilityId: string): Promise<{ response_markdown: string }> => {
  const response = await api.post('/api/fix/ai', { vulnerability_id: vulnerabilityId });
  return response.data;
};

export const createCheckoutSession = async () => {
  const { data } = await api.post('/api/stripe/checkout');
  return data;
};

export const getCachedFix = async (vulnerabilityId: string): Promise<{ response_markdown: string } | null> => {
  try {
    const response = await api.get(`/api/fix/${vulnerabilityId}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
};

export const sendChatMessage = async (vulnerability_id: string, content: string): Promise<{ content: string }> => {
  const response = await api.post('/api/fix/chat', { vulnerability_id, content });
  return response.data;
};

export const getChatHistory = async (vulnerability_id: string): Promise<{ messages: any[], totalUsed: number }> => {
  const response = await api.get(`/api/fix/chat/${vulnerability_id}`);
  return response.data;
};

export const trustPath = async (scanId: string, filePath: string) => {
  const response = await api.post('/api/scan/trust', { scan_id: scanId, file_path: filePath });
  return response.data;
};
