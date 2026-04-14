const express = require('express');
const app = express();
app.use(express.json());

// 1. Hardcoded Secrets (Detected by Exposed Keys)
const SUPABASE_KEY = "dummy-supabase-key-for-testing-purposes";
const MY_CUSTOM_SECRET = "sk_live_123_but_fake_so_github_doesnt_block_it_lmao"; 

// 2. Dev Login Bypass (Detected by Exposed Keys / Dev Credential Flaw)
const developerTestEmail = "test@vibesec.local";
const defaultPassword = "password123";
const adminBackdoor = "admin@vibesec.com";

app.post('/api/auth/login', (req, res) => {
    // 3. Rate Limit Vulnerability (No rate limit middleware on authentication endpoint)
    const { email, password } = req.body;
    
    if (email === adminBackdoor && password === defaultPassword) {
        return res.json({ token: "Bearer admin123" });
    }
    
    // Auth logic goes here
    res.send("Authentication failed");
});

// 4. Broken Authentication (Missing auth protection on sensitive endpoint)
app.post('/api/admin/system', (req, res) => {
    // Attackers can access this without a token
    res.json({ status: "System online", secrets: [SUPABASE_KEY] });
});

app.get('/api/users/data', (req, res) => {
    // 5. Insecure Direct Object Reference (IDOR)
    const userId = req.body.userId; 
    // Does not verify that the authenticated token matches the requested userId
    
    // 6. SQL Injection (Unsanitized unparameterized string concatenation)
    const query = "SELECT * FROM users WHERE id = '" + userId + "'";
    
    // Fake DB execution
    // db.execute(query);
    
    res.json({ message: "Fetched user data for " + userId, query });
});

app.get('/api/users/search', (req, res) => {
    // SQL Injection variant 2 (Template literals without parameterization)
    const username = req.query.username;
    const query = `SELECT * FROM users WHERE username = '${username}'`;
    
    res.json({ result: "Data retrieved" });
});

app.listen(3000, () => {
    console.log('Insecure testing app running on port 3000');
});
