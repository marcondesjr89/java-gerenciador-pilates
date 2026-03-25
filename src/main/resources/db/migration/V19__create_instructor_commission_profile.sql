create table if not exists instructor_commission_profile (
    id uuid primary key,
    instructor_user_id uuid not null unique references app_user(id),
    instructor_name varchar(255) not null,
    commission_model varchar(50) not null,
    unit_amount numeric(12,2) not null,
    active boolean not null default true,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp
);
