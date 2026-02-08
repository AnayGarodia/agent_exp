const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, '../../dorian.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    organization_name TEXT,
    business_category TEXT,
    team_size TEXT,
    primary_goals TEXT,
    tools TEXT,
    credits INTEGER DEFAULT 100,
    total_credits_used INTEGER DEFAULT 0,
    subscription_tier TEXT DEFAULT 'free',
    subscription_expires INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )
`);

// Create workflows table
db.exec(`
  CREATE TABLE IF NOT EXISTS workflows (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    blockly_state TEXT,
    agent_type TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// Create user sessions table
db.exec(`
  CREATE TABLE IF NOT EXISTS user_sessions (
    sid TEXT PRIMARY KEY,
    user_id TEXT,
    session_data TEXT NOT NULL,
    expires INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// Create API usage tracking table
db.exec(`
  CREATE TABLE IF NOT EXISTS api_usage (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    action_type TEXT NOT NULL,
    credits_used INTEGER NOT NULL,
    workflow_id TEXT,
    details TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE SET NULL
  )
`);

// Create credit transactions table
db.exec(`
  CREATE TABLE IF NOT EXISTS credit_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL,
    description TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// Migration: Add credits columns to existing users table if they don't exist
try {
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  const hasCredits = tableInfo.some(col => col.name === 'credits');

  if (!hasCredits) {
    console.log('Adding credits columns to existing users...');
    db.exec(`
      ALTER TABLE users ADD COLUMN credits INTEGER DEFAULT 100;
      ALTER TABLE users ADD COLUMN total_credits_used INTEGER DEFAULT 0;
      ALTER TABLE users ADD COLUMN subscription_tier TEXT DEFAULT 'free';
      ALTER TABLE users ADD COLUMN subscription_expires INTEGER;
    `);
    // Give existing users 100 starting credits
    db.exec(`UPDATE users SET credits = 100 WHERE credits IS NULL`);
    console.log('Credits system migration complete');
  }
} catch (error) {
  console.log('Credits columns already exist or migration not needed');
}

console.log('✅ Database initialized successfully with credits system');

module.exports = db;
