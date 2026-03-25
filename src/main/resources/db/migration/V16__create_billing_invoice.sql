create table if not exists billing_invoice (
    id uuid primary key,
    student_id uuid not null references student(id),
    student_name varchar(255) not null,
    subscription_id uuid not null references student_subscription(id),
    reference_month date not null,
    due_date date not null,
    amount_due numeric(12,2) not null,
    status varchar(50) not null,
    paid_at timestamptz,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp
);

create index if not exists idx_billing_invoice_status_due
    on billing_invoice (status, due_date);
