create table if not exists student_portal_account (
    id uuid primary key,
    student_id uuid not null unique references student(id),
    email varchar(255) not null unique,
    password_hash varchar(255) not null,
    active boolean not null default true,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp
);
