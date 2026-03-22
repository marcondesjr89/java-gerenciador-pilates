create table if not exists app_user (
    id uuid primary key,
    email varchar(255) not null unique,
    full_name varchar(255) not null,
    password_hash varchar(255) not null,
    role varchar(50) not null,
    active boolean not null default true,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp
);
