create table if not exists student_anamnesis (
    id uuid primary key,
    student_id uuid not null unique references student(id),
    has_pathologies boolean not null default false,
    pathology_details varchar(1000),
    has_surgeries boolean not null default false,
    surgery_details varchar(1000),
    has_pain boolean not null default false,
    pain_details varchar(1000),
    has_hypertension boolean not null default false,
    has_osteoporosis boolean not null default false,
    is_pregnant boolean not null default false,
    medical_clearance_required boolean not null default false,
    general_observations varchar(1500),
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp
);
