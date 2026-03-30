package br.com.gerenciadorpilates.students.application;

import br.com.gerenciadorpilates.platform.domain.ResourceNotFoundException;
import br.com.gerenciadorpilates.platform.security.JwtService;
import br.com.gerenciadorpilates.students.api.ConfigureStudentPortalAccountRequest;
import br.com.gerenciadorpilates.students.api.StudentPortalAccountResponse;
import br.com.gerenciadorpilates.students.api.StudentPortalLoginRequest;
import br.com.gerenciadorpilates.students.api.StudentPortalLoginResponse;
import br.com.gerenciadorpilates.students.domain.Student;
import br.com.gerenciadorpilates.students.domain.StudentPortalAccount;
import br.com.gerenciadorpilates.students.infrastructure.StudentPortalAccountRepository;
import br.com.gerenciadorpilates.students.infrastructure.StudentRepository;
import java.util.Map;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StudentPortalAccountService {

    private final StudentPortalAccountRepository portalAccountRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public StudentPortalAccountService(
            StudentPortalAccountRepository portalAccountRepository,
            StudentRepository studentRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.portalAccountRepository = portalAccountRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public StudentPortalAccountResponse configure(UUID studentId, ConfigureStudentPortalAccountRequest request) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Aluno nao encontrado."));

        String normalizedEmail = request.email().trim().toLowerCase();

        StudentPortalAccount account = portalAccountRepository.findByStudentId(studentId)
                .map(existing -> {
                    existing.activate(normalizedEmail, passwordEncoder.encode(request.password()));
                    return existing;
                })
                .orElseGet(() -> new StudentPortalAccount(
                        UUID.randomUUID(),
                        studentId,
                        normalizedEmail,
                        passwordEncoder.encode(request.password()),
                        true
                ));

        StudentPortalAccount savedAccount = portalAccountRepository.save(account);
        return StudentPortalAccountResponse.from(savedAccount);
    }

    @Transactional(readOnly = true)
    public StudentPortalAccountResponse getByStudentId(UUID studentId) {
        studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Aluno nao encontrado."));

        StudentPortalAccount account = portalAccountRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Conta do portal ainda nao configurada."));

        return StudentPortalAccountResponse.from(account);
    }

    @Transactional(readOnly = true)
    public StudentPortalLoginResponse login(StudentPortalLoginRequest request) {
        StudentPortalAccount account = portalAccountRepository.findByEmailIgnoreCaseAndActiveTrue(request.email().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Credenciais invalidas."));

        if (!passwordEncoder.matches(request.password(), account.getPasswordHash())) {
            throw new IllegalArgumentException("Credenciais invalidas.");
        }

        Student student = studentRepository.findById(account.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Aluno nao encontrado."));

        String token = jwtService.generateToken(
                account.getEmail(),
                "STUDENT",
                Map.of(
                        "principalType", "STUDENT",
                        "principalId", account.getStudentId().toString(),
                        "fullName", student.getFullName()
                )
        );

        return new StudentPortalLoginResponse(
                token,
                "Bearer",
                jwtService.getExpirationInSeconds(),
                student.getId(),
                account.getEmail(),
                student.getFullName()
        );
    }
}
