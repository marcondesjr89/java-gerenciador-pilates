create table if not exists notification_outbox_entry (
    id uuid primary key,
    channel varchar(50) not null,
    status varchar(50) not null,
    recipient_reference varchar(255) not null,
    message_template varchar(100) not null,
    payload_json varchar(4000) not null,
    created_at timestamptz not null default current_timestamp
);
