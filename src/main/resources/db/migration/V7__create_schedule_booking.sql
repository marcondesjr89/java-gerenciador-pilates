create table if not exists schedule_booking (
    id uuid primary key,
    slot_id uuid not null references schedule_slot(id),
    student_id uuid not null references student(id),
    student_name varchar(255) not null,
    status varchar(50) not null,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp
);

create index if not exists idx_schedule_booking_slot_status
    on schedule_booking (slot_id, status);
