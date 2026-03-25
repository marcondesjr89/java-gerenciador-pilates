create table if not exists billing_plan (
    id uuid primary key,
    name varchar(150) not null unique,
    price_amount numeric(12,2) not null,
    billing_cycle_months integer not null,
    active boolean not null default true,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp
);
