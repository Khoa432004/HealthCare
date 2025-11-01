-- Drop old notification table if exists
DROP TABLE IF EXISTS notification CASCADE;

-- Create new notification table with target_roles as text array
CREATE TABLE notification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    target_roles TEXT[], -- Array of roles: ['DOCTOR', 'PATIENT', 'ADMIN'] or NULL for all
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_created_by FOREIGN KEY (created_by) REFERENCES user_account(id) ON DELETE CASCADE
);

-- Create notification_user table
CREATE TABLE notification_user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL,
    user_id UUID NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user_notification FOREIGN KEY (notification_id) REFERENCES notification(id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_user_user FOREIGN KEY (user_id) REFERENCES user_account(id) ON DELETE CASCADE,
    CONSTRAINT uk_notification_user UNIQUE (notification_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_notification_created_at ON notification(created_at DESC);
CREATE INDEX idx_notification_target_roles ON notification USING GIN(target_roles); -- GIN index for array queries
CREATE INDEX idx_notification_created_by ON notification(created_by);

CREATE INDEX idx_notification_user_user_id ON notification_user(user_id);
CREATE INDEX idx_notification_user_notification_id ON notification_user(notification_id);
CREATE INDEX idx_notification_user_is_read ON notification_user(is_read);
CREATE INDEX idx_notification_user_created_at ON notification_user(created_at DESC);
