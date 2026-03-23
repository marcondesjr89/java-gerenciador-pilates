package br.com.gerenciadorpilates.clinical.application;

import br.com.gerenciadorpilates.clinical.api.StudentAnamnesisResponse;
import br.com.gerenciadorpilates.clinical.api.UpsertStudentAnamnesisRequest;
import br.com.gerenciadorpilates.clinical.domain.StudentAnamnesis;
import br.com.gerenciadorpilates.clinical.infrastructure.StudentAnamnesisRepository;
import br.com.gerenciadorpilates.platform.domain.ResourceNotFoundException;
import br.com.gerenciadorpilates.students.infrastructure.StudentRepository;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StudentAnamnesisService {

    private final StudentAnamnesisRepository anamnesisRepository;
    private final StudentRepository studentRepository;

    public StudentAnamnesisService(
            StudentAnamnesisRepository anamnesisRepository,
            StudentRepository studentRepository
    ) {
        this.anamnesisRepository = anamnesisRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional
    public StudentAnamnesisResponse upsert(UUID studentId, UpsertStudentAnamnesisRequest request) {
        ensureStudentExists(studentId);

        StudentAnamnesis anamnesis = anamnesisRepository.findByStudentId(studentId)
                .map(existing -> updateExisting(existing, request))
                .orElseGet(() -> createNew(studentId, request));

        StudentAnamnesis savedAnamnesis = anamnesisRepository.save(anamnesis);
        return StudentAnamnesisResponse.from(savedAnamnesis);
    }

    @Transactional(readOnly = true)
    public StudentAnamnesisResponse getByStudentId(UUID studentId) {
        ensureStudentExists(studentId);
        StudentAnamnesis anamnesis = anamnesisRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Anamnese nao encontrada para o aluno informado."));
        return StudentAnamnesisResponse.from(anamnesis);
    }

    @Transactional(readOnly = true)
    public StudentAnamnesisResponse findOptionalByStudentId(UUID studentId) {
        ensureStudentExists(studentId);
        return anamnesisRepository.findByStudentId(studentId)
                .map(StudentAnamnesisResponse::from)
                .orElse(null);
    }

    private void ensureStudentExists(UUID studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Aluno nao encontrado.");
        }
    }

    private StudentAnamnesis updateExisting(StudentAnamnesis existing, UpsertStudentAnamnesisRequest request) {
        existing.update(
                request.hasPathologies(),
                normalize(request.pathologyDetails()),
                request.hasSurgeries(),
                normalize(request.surgeryDetails()),
                request.hasPain(),
                normalize(request.painDetails()),
                request.hasHypertension(),
                request.hasOsteoporosis(),
                request.isPregnant(),
                request.medicalClearanceRequired(),
                normalize(request.generalObservations())
        );
        return existing;
    }

    private StudentAnamnesis createNew(UUID studentId, UpsertStudentAnamnesisRequest request) {
        return new StudentAnamnesis(
                UUID.randomUUID(),
                studentId,
                request.hasPathologies(),
                normalize(request.pathologyDetails()),
                request.hasSurgeries(),
                normalize(request.surgeryDetails()),
                request.hasPain(),
                normalize(request.painDetails()),
                request.hasHypertension(),
                request.hasOsteoporosis(),
                request.isPregnant(),
                request.medicalClearanceRequired(),
                normalize(request.generalObservations())
        );
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
