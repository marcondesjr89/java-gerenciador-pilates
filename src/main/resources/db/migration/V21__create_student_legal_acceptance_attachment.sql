create table student_legal_acceptance_attachment (
    id uuid primary key,
    student_id uuid not null references student(id),
    legal_acceptance_id uuid not null references student_legal_acceptance(id),
    attachment_type varchar(40) not null,
    original_file_name varchar(255) not null,
    storage_key varchar(500) not null unique,
    content_type varchar(120) not null,
    file_size bigint not null,
    uploaded_by_user_id uuid not null,
    uploaded_by_user_name varchar(255) not null,
    created_at timestamptz not null
);

create index idx_student_legal_acceptance_attachment_acceptance
    on student_legal_acceptance_attachment(legal_acceptance_id, created_at asc);
