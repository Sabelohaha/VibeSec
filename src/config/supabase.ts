import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

// Create a single supabase admin client to communicate directly from backend
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
