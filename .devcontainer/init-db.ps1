# PowerShell script for database initialization (Windows)

Write-Host "Waiting for PostgreSQL to start..."

# Wait for PostgreSQL to be ready
do {
    Start-Sleep -Seconds 1
    $ready = & pg_isready -h localhost -p 5432 -U postgres 2>$null
} while ($LASTEXITCODE -ne 0)

Write-Host "PostgreSQL is ready!"

# Create sample tables
$sqlScript = @"
-- Sample table for a React app
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample data
INSERT INTO users (username, email) VALUES 
    ('demo_user', 'demo@example.com'),
    ('test_user', 'test@example.com')
ON CONFLICT (username) DO NOTHING;

-- Display tables
\dt
"@

$sqlScript | & psql -h localhost -U postgres -d postgres

Write-Host "Database initialization complete!"
