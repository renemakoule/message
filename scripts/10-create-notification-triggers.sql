-- Triggers pour créer automatiquement les notifications

-- Function pour créer une notification de message
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  conversation_participants_record RECORD;
  sender_name TEXT;
  conversation_name TEXT;
BEGIN
  -- Récupérer le nom de l'expéditeur
  SELECT name INTO sender_name FROM users WHERE id = NEW.sender_id;
  
  -- Récupérer le nom de la conversation
  SELECT name INTO conversation_name FROM conversations WHERE id = NEW.conversation_id;
  
  -- Créer des notifications pour tous les participants de la conversation (sauf l'expéditeur)
  FOR conversation_participants_record IN
    SELECT cp.user_id
    FROM conversation_participants cp
    WHERE cp.conversation_id = NEW.conversation_id
    AND cp.user_id != NEW.sender_id
  LOOP
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      data
    ) VALUES (
      conversation_participants_record.user_id,
      'message',
      sender_name,
      CASE 
        WHEN NEW.type = 'text' THEN NEW.content
        WHEN NEW.type = 'image' THEN '📷 Image'
        WHEN NEW.type = 'video' THEN '🎥 Vidéo'
        WHEN NEW.type = 'file' THEN '📎 Fichier'
        WHEN NEW.type = 'audio' THEN '🎵 Audio'
        ELSE 'Nouveau message'
      END,
      jsonb_build_object(
        'conversation_id', NEW.conversation_id,
        'message_id', NEW.id,
        'sender_id', NEW.sender_id,
        'conversation_name', conversation_name
      )
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour créer des notifications lors de l'insertion de nouveaux messages
DROP TRIGGER IF EXISTS trigger_create_message_notification ON messages;
CREATE TRIGGER trigger_create_message_notification
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION create_message_notification();

-- Function pour créer une notification d'invitation
CREATE OR REPLACE FUNCTION create_invitation_notification()
RETURNS TRIGGER AS $$
DECLARE
  from_user_name TEXT;
  conversation_name TEXT;
BEGIN
  -- Récupérer le nom de l'expéditeur de l'invitation
  SELECT name INTO from_user_name FROM users WHERE id = NEW.from_user_id;
  
  -- Récupérer le nom de la conversation
  SELECT name INTO conversation_name FROM conversations WHERE id = NEW.conversation_id;
  
  -- Créer une notification pour le destinataire de l'invitation
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data
  ) VALUES (
    NEW.to_user_id,
    'invitation',
    from_user_name,
    CASE 
      WHEN NEW.type = 'personal' THEN 'Vous a invité à une conversation privée'
      WHEN NEW.type = 'group' THEN 'Vous a invité à rejoindre le groupe "' || conversation_name || '"'
      ELSE 'Vous a envoyé une invitation'
    END,
    jsonb_build_object(
      'conversation_id', NEW.conversation_id,
      'invitation_id', NEW.id,
      'from_user_id', NEW.from_user_id,
      'invitation_type', NEW.type,
      'conversation_name', conversation_name
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour créer des notifications lors de l'insertion de nouvelles invitations
DROP TRIGGER IF EXISTS trigger_create_invitation_notification ON invitations;
CREATE TRIGGER trigger_create_invitation_notification
  AFTER INSERT ON invitations
  FOR EACH ROW
  EXECUTE FUNCTION create_invitation_notification();

-- Function pour mettre à jour les notifications lors du changement de statut d'invitation
CREATE OR REPLACE FUNCTION update_invitation_notification()
RETURNS TRIGGER AS $$
DECLARE
  to_user_name TEXT;
  conversation_name TEXT;
BEGIN
  -- Si le statut a changé vers 'accepted' ou 'declined'
  IF OLD.status = 'pending' AND NEW.status IN ('accepted', 'declined') THEN
    -- Récupérer le nom du destinataire
    SELECT name INTO to_user_name FROM users WHERE id = NEW.to_user_id;
    
    -- Récupérer le nom de la conversation
    SELECT name INTO conversation_name FROM conversations WHERE id = NEW.conversation_id;
    
    -- Créer une notification pour l'expéditeur de l'invitation
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      data
    ) VALUES (
      NEW.from_user_id,
      'invitation',
      to_user_name,
      CASE 
        WHEN NEW.status = 'accepted' THEN 'A accepté votre invitation'
        WHEN NEW.status = 'declined' THEN 'A décliné votre invitation'
        ELSE 'A répondu à votre invitation'
      END,
      jsonb_build_object(
        'conversation_id', NEW.conversation_id,
        'invitation_id', NEW.id,
        'to_user_id', NEW.to_user_id,
        'status', NEW.status,
        'conversation_name', conversation_name
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour les notifications lors du changement de statut d'invitation
DROP TRIGGER IF EXISTS trigger_update_invitation_notification ON invitations;
CREATE TRIGGER trigger_update_invitation_notification
  AFTER UPDATE ON invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_invitation_notification();
 