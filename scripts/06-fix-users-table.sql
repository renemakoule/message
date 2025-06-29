-- Fix users table for Supabase Auth compatibility
-- This script should be run after the initial table creation

-- Drop the default constraint on id column
ALTER TABLE users ALTER COLUMN id DROP DEFAULT;

-- Update the id column to accept any UUID (not just generated ones)
-- This allows Supabase Auth to insert users with their own UUIDs
ALTER TABLE users ALTER COLUMN id TYPE UUID USING id::UUID;

-- Add a comment to clarify the purpose
COMMENT ON COLUMN users.id IS 'UUID from Supabase Auth - should match auth.users.id';

-- Verify the table structure
\d users; 