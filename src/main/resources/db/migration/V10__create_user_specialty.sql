create table if not exists user_specialty (
    user_id uuid not null references app_user(id),
    specialty varchar(100) not null,
    primary key (user_id, specialty)
);
