INSERT INTO "user" (email, password, first_name, last_name, roles, is_active, created_at, updated_at)
VALUES (
    'admin@example.com',
    '$2y$13$DrQfU00Rd8smNNJPyHGajOAF33FNoyO/cF/wfLZYtTzHIX3x1oL66',
    'Admin',
    'User',
    '["ROLE_ADMIN"]',
    true,
    NOW(),
    NOW()
);