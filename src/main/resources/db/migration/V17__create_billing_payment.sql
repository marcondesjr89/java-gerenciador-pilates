create table if not exists billing_payment (
    id uuid primary key,
    invoice_id uuid not null references billing_invoice(id),
    student_id uuid not null references student(id),
    amount_paid numeric(12,2) not null,
    payment_method varchar(50) not null,
    paid_at timestamptz not null,
    external_reference varchar(255),
    created_at timestamptz not null default current_timestamp
);

create index if not exists idx_billing_payment_invoice
    on billing_payment (invoice_id, paid_at desc);
