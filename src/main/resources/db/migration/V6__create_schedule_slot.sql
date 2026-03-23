create table if not exists schedule_slot (
    id uuid primary key,
    instructor_user_id uuid not null references app_user(id),
    instructor_name varchar(255) not null,
    start_time timestamptz not null,
    end_time timestamptz not null,
    capacity integer not null,
    booked_count integer not null default 0,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp
);

create index if not exists idx_schedule_slot_instructor_time
    on schedule_slot (instructor_user_id, start_time, end_time);
