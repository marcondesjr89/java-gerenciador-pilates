create table if not exists student_progress_entry (
    id uuid primary key,
    student_id uuid not null references student(id),
    created_by_user_id uuid not null references app_user(id),
    created_by_user_name varchar(255) not null,
    recorded_at timestamptz not null,
    instructor_notes varchar(2000) not null,
    flexibility_score integer,
    strength_score integer,
    pain_level integer,
    created_at timestamptz not null default current_timestamp
);
