create table if not exists financial_expense (
    id uuid primary key,
    description varchar(150) not null,
    expense_type varchar(20) not null,
    amount numeric(12,2) not null,
    occurred_on date not null,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp
);

create index if not exists idx_financial_expense_occurred_on
    on financial_expense (occurred_on);
