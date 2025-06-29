-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Conversations policies
CREATE POLICY "Users can view conversations they participate in" ON conversations
    FOR SELECT USING (
        id IN (
            SELECT conversation_id FROM conversation_participants 
            WHERE user_id = auth.uid()
        )
        OR is_public = true
    );

CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update conversations" ON conversations
    FOR UPDATE USING (
        id IN (
            SELECT conversation_id FROM conversation_participants 
            WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- Conversation participants policies
CREATE POLICY "Users can view participants of their conversations" ON conversation_participants
    FOR SELECT USING (
        conversation_id IN (
            SELECT conversation_id FROM conversation_participants 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join conversations via invitations" ON conversation_participants
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        conversation_id IN (
            SELECT conversation_id FROM invitations 
            WHERE to_user_id = auth.uid() AND status = 'accepted'
        )
    );

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT conversation_id FROM conversation_participants 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages to their conversations" ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        conversation_id IN (
            SELECT conversation_id FROM conversation_participants 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own messages" ON messages
    FOR UPDATE USING (sender_id = auth.uid());

-- Message reads policies
CREATE POLICY "Users can view message reads in their conversations" ON message_reads
    FOR SELECT USING (
        message_id IN (
            SELECT m.id FROM messages m
            INNER JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
            WHERE cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can mark messages as read" ON message_reads
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Invitations policies
CREATE POLICY "Users can view invitations sent to them or by them" ON invitations
    FOR SELECT USING (to_user_id = auth.uid() OR from_user_id = auth.uid());

CREATE POLICY "Users can send invitations" ON invitations
    FOR INSERT WITH CHECK (from_user_id = auth.uid());

CREATE POLICY "Users can update invitations sent to them" ON invitations
    FOR UPDATE USING (to_user_id = auth.uid());

-- Typing indicators policies
CREATE POLICY "Users can view typing indicators in their conversations" ON typing_indicators
    FOR SELECT USING (
        conversation_id IN (
            SELECT conversation_id FROM conversation_participants 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own typing indicators" ON typing_indicators
    FOR ALL USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);
