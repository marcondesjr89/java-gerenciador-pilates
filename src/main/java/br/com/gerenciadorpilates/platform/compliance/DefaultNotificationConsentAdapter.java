package br.com.gerenciadorpilates.platform.compliance;

import br.com.gerenciadorpilates.notifications.application.NotificationConsentPort;
import br.com.gerenciadorpilates.students.domain.Student;
import br.com.gerenciadorpilates.students.domain.StudentLegalAcceptance;
import br.com.gerenciadorpilates.students.domain.StudentLegalAcceptanceStatus;
import br.com.gerenciadorpilates.students.domain.StudentLegalTermType;
import br.com.gerenciadorpilates.students.domain.StudentStatus;
import br.com.gerenciadorpilates.students.infrastructure.StudentLegalAcceptanceRepository;
import br.com.gerenciadorpilates.students.infrastructure.StudentRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class DefaultNotificationConsentAdapter implements NotificationConsentPort {

    private final StudentRepository studentRepository;
    private final StudentLegalAcceptanceRepository legalAcceptanceRepository;

    public DefaultNotificationConsentAdapter(
            StudentRepository studentRepository,
            StudentLegalAcceptanceRepository legalAcceptanceRepository
    ) {
        this.studentRepository = studentRepository;
        this.legalAcceptanceRepository = legalAcceptanceRepository;
    }

    @Override
    public boolean hasWhatsAppConsent(UUID studentId) {
        Optional<Student> studentOpt = studentRepository.findById(studentId);
        if (studentOpt.isEmpty()) {
            return false;
        }

        Student student = studentOpt.get();
        if (student.getStatus() == StudentStatus.ANONYMIZED) {
            return false;
        }

        List<StudentLegalAcceptance> acceptances = legalAcceptanceRepository
                .findAllByStudentIdOrderByCreatedAtDesc(studentId);

        if (acceptances.isEmpty()) {
            return student.isLgpdConsent();
        }

        return acceptances.stream()
                .filter(a -> a.getStatus() == StudentLegalAcceptanceStatus.ACCEPTED)
                .anyMatch(a -> a.getTermType() == StudentLegalTermType.WHATSAPP_COMMUNICATION
                        || (a.getCoveredTermTypes() != null && a.getCoveredTermTypes().contains(StudentLegalTermType.WHATSAPP_COMMUNICATION)));
    }
}
