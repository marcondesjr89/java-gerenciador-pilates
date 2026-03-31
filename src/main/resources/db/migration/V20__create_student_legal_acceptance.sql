create table student_legal_acceptance (
    id uuid primary key,
    student_id uuid not null references student(id),
    term_type varchar(60) not null,
    title varchar(255) not null,
    terms_version varchar(60) not null,
    legal_basis varchar(255),
    document_hash varchar(64) not null,
    term_body text not null,
    status varchar(40) not null,
    collection_method varchar(40),
    accepted_at timestamptz,
    evidence_note varchar(1000),
    captured_by_user_id uuid,
    captured_by_user_name varchar(255),
    created_at timestamptz not null,
    updated_at timestamptz not null
);

create index idx_student_legal_acceptance_student on student_legal_acceptance(student_id, created_at desc);
