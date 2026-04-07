-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: scans
CREATE TABLE IF NOT EXISTS scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- References auth.users(id). Null allowed for 1 public scan.
    repo_url TEXT NOT NULL,
    repo_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'scanning', 'complete', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: scans
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own scans" ON scans FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can create their own scans" ON scans FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Table: vulnerabilities
CREATE TABLE IF NOT EXISTS vulnerabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scan_id UUID REFERENCES scans(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    line_number INTEGER NOT NULL,
    general_fix TEXT,
    is_false_positive BOOLEAN DEFAULT FALSE,
    is_ignored BOOLEAN DEFAULT FALSE,
    verification_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: vulnerabilities
ALTER TABLE vulnerabilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view vulnerabilities of their scans" ON vulnerabilities FOR SELECT USING (
    EXISTS (SELECT 1 FROM scans WHERE scans.id = vulnerabilities.scan_id AND (scans.user_id = auth.uid() OR scans.user_id IS NULL))
);

-- Table: ai_fixes
CREATE TABLE IF NOT EXISTS ai_fixes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    vulnerability_id UUID REFERENCES vulnerabilities(id) ON DELETE CASCADE,
    response_markdown TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: ai_fixes
ALTER TABLE ai_fixes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own ai fixes" ON ai_fixes FOR SELECT USING (auth.uid() = user_id);

-- Table: ai_fix_usage
CREATE TABLE IF NOT EXISTS ai_fix_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    monthly_count INTEGER NOT NULL DEFAULT 0,
    last_reset TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: ai_fix_usage
ALTER TABLE ai_fix_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own fix usage" ON ai_fix_usage FOR SELECT USING (auth.uid() = user_id);

-- Table: ai_chat_messages
CREATE TABLE IF NOT EXISTS ai_chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    vulnerability_id UUID REFERENCES vulnerabilities(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'model')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: ai_chat_messages
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own chat messages" ON ai_chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own chat messages" ON ai_chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Table: ignored_paths
CREATE TABLE IF NOT EXISTS ignored_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    repo_url TEXT NOT NULL,
    file_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: ignored_paths
ALTER TABLE ignored_paths ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own ignored paths" ON ignored_paths FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own ignored paths" ON ignored_paths FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own ignored paths" ON ignored_paths FOR DELETE USING (auth.uid() = user_id);
