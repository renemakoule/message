-- Insert sample users (these will be replaced by real Google Auth users)
INSERT INTO users (id, email, name, avatar_url, status, about) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'alice@example.com', 'Alice Johnson', '/placeholder.svg?height=40&width=40', 'online', 'Développeuse passionnée'),
    ('550e8400-e29b-41d4-a716-446655440002', 'bob@example.com', 'Bob Smith', '/placeholder.svg?height=40&width=40', 'away', 'Designer UI/UX'),
    ('550e8400-e29b-41d4-a716-446655440003', 'charlie@example.com', 'Charlie Brown', '/placeholder.svg?height=40&width=40', 'offline', 'Chef de projet'),
    ('550e8400-e29b-41d4-a716-446655440004', 'diana@example.com', 'Diana Prince', '/placeholder.svg?height=40&width=40', 'online', 'Consultante en stratégie')
ON CONFLICT (email) DO NOTHING;

-- Insert sample conversations
INSERT INTO conversations (id, name, type, description, is_public, created_by) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', 'Équipe Développement', 'group', 'Discussion pour l''équipe de développement', false, '550e8400-e29b-41d4-a716-446655440001'),
    ('660e8400-e29b-41d4-a716-446655440002', 'Projets Open Source', 'group', 'Partage de projets open source intéressants', true, '550e8400-e29b-41d4-a716-446655440002'),
    ('660e8400-e29b-41d4-a716-446655440003', 'Alice & Bob', 'personal', 'Conversation privée', false, '550e8400-e29b-41d4-a716-446655440001'),
    (uuid_generate_v4(), 'Développeurs JavaScript', 'Communauté de développeurs JS pour partager des astuces et projets', 'group', true, null),
    (uuid_generate_v4(), 'Photographes Amateurs', 'Partagez vos photos et recevez des conseils de la communauté', 'group', true, null),
    (uuid_generate_v4(), 'Cuisine du Monde', 'Recettes, astuces culinaires et découvertes gastronomiques', 'group', true, null),
    (uuid_generate_v4(), 'Fitness & Bien-être', 'Motivation, conseils fitness et partage d''expériences sportives', 'group', true, null),
    (uuid_generate_v4(), 'Voyageurs', 'Conseils de voyage, bons plans et récits d''aventures', 'group', true, null)
ON CONFLICT (id) DO NOTHING;

-- Insert conversation participants
INSERT INTO conversation_participants (conversation_id, user_id, role, status, joined_at) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'admin', 'active', NOW()),
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'member', 'active', NOW()),
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'member', 'active', NOW()),
    
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'admin', 'active', NOW()),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'member', 'active', NOW()),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'member', 'active', NOW()),
    
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'member', 'active', NOW()),
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'member', 'active', NOW())
ON CONFLICT (conversation_id, user_id) DO NOTHING;

-- Insert sample messages
INSERT INTO messages (conversation_id, sender_id, content, type, status) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Salut l''équipe ! Comment avance le projet ?', 'text', 'read'),
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Ça avance bien ! J''ai terminé les maquettes.', 'text', 'read'),
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'Parfait ! On peut planifier la prochaine étape.', 'text', 'delivered'),
    
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Bienvenue dans le groupe Open Source !', 'text', 'read'),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Merci ! Hâte de découvrir de nouveaux projets.', 'text', 'read'),
    
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Salut Bob ! Tu as du temps pour discuter du design ?', 'text', 'read'),
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Bien sûr ! Je suis disponible cet après-midi.', 'text', 'sent');

-- Insert sample invitations
INSERT INTO invitations (from_user_id, to_user_id, conversation_id, type, status, message) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'group', 'pending', 'Rejoins notre équipe de développement !'),
    ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', 'group', 'pending', 'Tu pourrais être intéressé par ce groupe open source.')
ON CONFLICT (from_user_id, to_user_id, conversation_id) DO NOTHING;

-- Function to clean up old typing indicators (run periodically)
SELECT cron.schedule('clean-typing-indicators', '*/30 * * * * *', 'SELECT clean_old_typing_indicators();');
