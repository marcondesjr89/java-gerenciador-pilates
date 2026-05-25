alter table student_legal_acceptance
    add column covered_term_types text;

update student_legal_acceptance
set covered_term_types = term_type
where covered_term_types is null;

alter table student_legal_acceptance
    alter column covered_term_types set not null;
