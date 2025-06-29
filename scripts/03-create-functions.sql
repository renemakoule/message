-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invitations_updated_at BEFORE UPDATE ON invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean old typing indicators
CREATE OR REPLACE FUNCTION clean_old_typing_indicators()
RETURNS void AS $$
BEGIN
  DELETE FROM typing_indicators 
  WHERE created_at < NOW() - INTERVAL '10 seconds';
END;
$$ LANGUAGE plpgsql;

-- Function to get conversation with last message
CREATE OR REPLACE FUNCTION get_conversations_with_last_message(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  type TEXT,
  avatar_url TEXT,
  is_public BOOLEAN,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  unread_count BIGINT,
  participant_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.description,
    c.type,
    c.avatar_url,
    c.is_public,
    c.created_by,
    c.created_at,
    c.updated_at,
    COALESCE(last_msg.content, 'Aucun message') as last_message,
    last_msg.created_at as last_message_at,
    COALESCE(unread.count, 0) as unread_count,
    COALESCE(participants.count, 0) as participant_count
  FROM conversations c
  INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
  LEFT JOIN LATERAL (
    SELECT content, created_at
    FROM messages m
    WHERE m.conversation_id = c.id
    ORDER BY m.created_at DESC
    LIMIT 1
  ) last_msg ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as count
    FROM messages m
    LEFT JOIN message_reads mr ON m.id = mr.message_id AND mr.user_id = user_uuid
    WHERE m.conversation_id = c.id 
    AND m.sender_id != user_uuid
    AND mr.id IS NULL
  ) unread ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as count
    FROM conversation_participants cp2
    WHERE cp2.conversation_id = c.id
  ) participants ON true
  WHERE cp.user_id = user_uuid
  ORDER BY COALESCE(last_msg.created_at, c.created_at) DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(conversation_uuid UUID, user_uuid UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO message_reads (message_id, user_id)
  SELECT m.id, user_uuid
  FROM messages m
  LEFT JOIN message_reads mr ON m.id = mr.message_id AND mr.user_id = user_uuid
  WHERE m.conversation_id = conversation_uuid
  AND m.sender_id != user_uuid
  AND mr.id IS NULL;
END;
$$ LANGUAGE plpgsql;
