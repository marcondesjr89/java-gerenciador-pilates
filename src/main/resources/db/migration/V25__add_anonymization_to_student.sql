alter table student
    add column if not exists anonymized_at timestamptz,
    add column if not exists anonymized_reason varchar(500);
