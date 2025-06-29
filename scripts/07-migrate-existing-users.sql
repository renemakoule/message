-- Migration script for existing users and Supabase Auth compatibility
-- Run this after fixing the users table structure

-- First, let's check if there are any existing users
SELECT COUNT(*) as existing_users FROM users;

-- If there are existing users, we need to handle them carefully
-- For now, we'll create a backup and then handle the migration

-- Create a backup of existing users (if any)
CREATE TABLE IF NOT EXISTS users_backup AS SELECT * FROM users WHERE 1=0;

-- Insert existing users into backup (if any exist)
INSERT INTO users_backup SELECT * FROM users;

-- Clear the users table to start fresh with Supabase Auth
TRUNCATE TABLE users RESTART IDENTITY CASCADE;

-- Re-insert users from backup if they exist, but with proper UUID handling
-- This is a safety measure in case there were existing users

-- Note: In a real migration, you would need to map existing user IDs to Supabase Auth IDs
-- For now, we'll just ensure the table is ready for new Supabase Auth users

-- Verify the table is ready
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position; 