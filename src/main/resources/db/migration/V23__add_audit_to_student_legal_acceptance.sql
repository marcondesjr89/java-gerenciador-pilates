alter table student_legal_acceptance
    add column if not exists audit_ip_address varchar(255),
    add column if not exists audit_user_agent varchar(1000),
    add column if not exists audit_session_key varchar(64),
    add column if not exists audit_collection_origin varchar(120);
