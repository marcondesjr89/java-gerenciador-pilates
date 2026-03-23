package br.com.gerenciadorpilates.clinical.application;

import br.com.gerenciadorpilates.clinical.api.CreateStudentProgressEntryRequest;
import br.com.gerenciadorpilates.clinical.api.StudentProgressEntryResponse;
import br.com.gerenciadorpilates.clinical.domain.StudentProgressEntry;
import br.com.gerenciadorpilates.clinical.infrastructure.StudentProgressEntryRepository;
import br.com.gerenciadorpilates.identityaccess.domain.AppUser;
import br.com.gerenciadorpilates.identityaccess.infrastructure.AppUserRepository;
import br.com.gerenciadorpilates.platform.domain.ResourceNotFoundException;
import br.com.gerenciadorpilates.students.infrastructure.StudentRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StudentProgressEntryService {

    private final StudentProgressEntryRepository progressEntryRepository;
    private final StudentRepository studentRepository;
    private final AppUserRepository userRepository;

    public StudentProgressEntryService(
            StudentProgressEntryRepository progressEntryRepository,
            StudentRepository studentRepository,
            AppUserRepository userRepository
    ) {
        this.progressEntryRepository = progressEntryRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public StudentProgressEntryResponse create(
            UUID studentId,
            String authenticatedEmail,
            CreateStudentProgressEntryRequest request
    ) {
        ensureStudentExists(studentId);
        AppUser author = userRepository.findByEmailIgnoreCaseAndActiveTrue(authenticatedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario autenticado nao encontrado."));

        StudentProgressEntry entry = new StudentProgressEntry(
                UUID.randomUUID(),
                studentId,
                author.getId(),
                author.getFullName(),
                request.recordedAt(),
                request.instructorNotes().trim(),
                request.flexibilityScore(),
                request.strengthScore(),
                request.painLevel()
        );

        StudentProgressEntry savedEntry = progressEntryRepository.save(entry);
        return StudentProgressEntryResponse.from(savedEntry);
    }

    @Transactional(readOnly = true)
    public List<StudentProgressEntryResponse> listByStudentId(UUID studentId) {
        ensureStudentExists(studentId);
        return progressEntryRepository.findAllByStudentIdOrderByRecordedAtDesc(studentId)
                .stream()
                .map(StudentProgressEntryResponse::from)
                .toList();
    }

    private void ensureStudentExists(UUID studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Aluno nao encontrado.");
        }
    }
}
