-- Performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_updated_at ON users(updated_at);

CREATE INDEX idx_conversations_type ON conversations(type);
CREATE INDEX idx_conversations_is_public ON conversations(is_public);
CREATE INDEX idx_conversations_created_by ON conversations(created_by);

CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_type ON messages(type);

CREATE INDEX idx_message_reads_message_id ON message_reads(message_id);
CREATE INDEX idx_message_reads_user_id ON message_reads(user_id);

CREATE INDEX idx_invitations_conversation_id ON invitations(conversation_id);
CREATE INDEX idx_invitations_from_user_id ON invitations(from_user_id);
CREATE INDEX idx_invitations_to_user_id ON invitations(to_user_id);
CREATE INDEX idx_invitations_status ON invitations(status);

CREATE INDEX idx_typing_indicators_conversation_id ON typing_indicators(conversation_id);
CREATE INDEX idx_typing_indicators_user_id ON typing_indicators(user_id);
CREATE INDEX idx_typing_indicators_created_at ON typing_indicators(created_at);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
