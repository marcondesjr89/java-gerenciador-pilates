alter table schedule_slot
    add column if not exists required_specialty varchar(100) not null default 'PILATES_APARELHOS';
