package br.com.gerenciadorpilates.students.infrastructure;

import br.com.gerenciadorpilates.students.domain.StudentLegalAcceptance;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentLegalAcceptanceRepository extends JpaRepository<StudentLegalAcceptance, UUID> {

    List<StudentLegalAcceptance> findAllByStudentIdOrderByCreatedAtDesc(UUID studentId);
}
