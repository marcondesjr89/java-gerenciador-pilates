create table if not exists student (
    id uuid primary key,
    full_name varchar(255) not null,
    cpf varchar(11) not null unique,
    email varchar(255) not null,
    phone_number varchar(20) not null,
    birth_date date,
    status varchar(50) not null,
    lgpd_consent boolean not null default false,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp
);
