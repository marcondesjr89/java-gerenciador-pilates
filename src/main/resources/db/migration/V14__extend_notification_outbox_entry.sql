alter table notification_outbox_entry
    add column if not exists attempted_at timestamptz,
    add column if not exists sent_at timestamptz,
    add column if not exists error_message varchar(500),
    add column if not exists updated_at timestamptz not null default current_timestamp;
