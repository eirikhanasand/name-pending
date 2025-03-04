DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'tekkom') THEN
        CREATE DATABASE tekkom;
    END IF;
END $$;

\c tekkom

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'tekkom') THEN
        CREATE USER tekkom WITH ENCRYPTED PASSWORD 'tekkom';
        GRANT ALL PRIVILEGES ON DATABASE tekkom TO tekkom;
    END IF;
END $$;

-- Scheduled messages
CREATE TABLE IF NOT EXISTS schedule (
    name TEXT PRIMARY KEY
);

-- Scheduled alerts
CREATE TABLE IF NOT EXISTS alerts (
    name TEXT PRIMARY KEY
);

-- Creates vulnerability table
-- CREATE TABLE IF NOT EXISTS vulnerabilities (
--     name TEXT PRIMARY KEY,
--     package_name TEXT NOT NULL,
--     ecosystem TEXT NOT NULL,
--     version_introduced TEXT NOT NULL,
--     version_fixed TEXT NOT NULL,
--     data JSONB NOT NULL,
--     CONSTRAINT unique_name_ecosystem_version UNIQUE (name, package_name, ecosystem, version_introduced, version_fixed)
-- );

-- Indexes for Blacklist
-- CREATE INDEX IF NOT EXISTS idx_blacklist_versions_name ON blacklist_versions (name);
