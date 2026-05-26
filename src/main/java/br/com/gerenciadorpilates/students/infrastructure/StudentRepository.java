package br.com.gerenciadorpilates.students.infrastructure;

import br.com.gerenciadorpilates.students.domain.Student;
import br.com.gerenciadorpilates.students.domain.StudentStatus;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface StudentRepository extends JpaRepository<Student, UUID> {

    Optional<Student> findByCpf(String cpf);

    long countByStatus(StudentStatus status);

    long countByLgpdConsentTrue();

    @Query("""
            select student
            from Student student
            where (:query is null or :query = '' or lower(student.fullName) like lower(concat('%', :query, '%'))
                or lower(student.email) like lower(concat('%', :query, '%'))
                or student.cpf like concat('%', :query, '%')
                or student.phoneNumber like concat('%', :query, '%'))
            order by student.fullName asc
            """)
    Page<Student> search(String query, Pageable pageable);
}
