-- Fix function permissions for RLS
-- This script grants the necessary permissions to the functions

-- Grant execute permission on all functions to authenticated users
GRANT EXECUTE ON FUNCTION get_conversations_with_last_message(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_messages_as_read(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION clean_old_typing_indicators() TO authenticated;

-- Grant execute permission on all functions to anon users (if needed)
GRANT EXECUTE ON FUNCTION get_conversations_with_last_message(UUID) TO anon;
GRANT EXECUTE ON FUNCTION mark_messages_as_read(UUID, UUID) TO anon;
GRANT EXECUTE ON FUNCTION clean_old_typing_indicators() TO anon;

-- Verify the permissions
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'get_conversations_with_last_message',
    'mark_messages_as_read',
    'clean_old_typing_indicators'
); 