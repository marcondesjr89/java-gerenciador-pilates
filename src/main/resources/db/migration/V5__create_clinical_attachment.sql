create table if not exists clinical_attachment (
    id uuid primary key,
    student_id uuid not null references student(id),
    progress_entry_id uuid not null references student_progress_entry(id),
    uploaded_by_user_id uuid not null references app_user(id),
    uploaded_by_user_name varchar(255) not null,
    original_file_name varchar(255) not null,
    storage_key varchar(500) not null unique,
    content_type varchar(255) not null,
    file_size bigint not null,
    created_at timestamptz not null default current_timestamp
);
