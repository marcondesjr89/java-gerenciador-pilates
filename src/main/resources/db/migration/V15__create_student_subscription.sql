create table if not exists student_subscription (
    id uuid primary key,
    student_id uuid not null references student(id),
    student_name varchar(255) not null,
    plan_id uuid not null references billing_plan(id),
    plan_name varchar(150) not null,
    status varchar(50) not null,
    start_date date not null,
    next_billing_date date not null,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp
);

create index if not exists idx_student_subscription_student_status
    on student_subscription (student_id, status);
