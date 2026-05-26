package br.com.gerenciadorpilates.students.infrastructure;

import br.com.gerenciadorpilates.students.domain.Student;
import br.com.gerenciadorpilates.students.domain.StudentStatus;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StudentRepository extends JpaRepository<Student, UUID> {

    Optional<Student> findByCpf(String cpf);

    long countByStatus(StudentStatus status);

    long countByLgpdConsentTrue();

    @Query("""
            select student
            from Student student
            where (:textQuery is null or :textQuery = ''
                or lower(student.fullName) like concat('%', :textQuery, '%')
                or lower(student.email) like concat('%', :textQuery, '%'))
                or (:digitsQuery is not null and :digitsQuery <> ''
                    and (student.cpf like concat('%', :digitsQuery, '%')
                        or student.phoneNumber like concat('%', :digitsQuery, '%')))
            order by student.fullName asc
            """)
    Page<Student> search(
            @Param("textQuery") String textQuery,
            @Param("digitsQuery") String digitsQuery,
            Pageable pageable
    );
}
