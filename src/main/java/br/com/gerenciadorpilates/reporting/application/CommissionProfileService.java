package br.com.gerenciadorpilates.reporting.application;

import br.com.gerenciadorpilates.identityaccess.domain.UserRole;
import br.com.gerenciadorpilates.identityaccess.infrastructure.AppUserRepository;
import br.com.gerenciadorpilates.platform.domain.ResourceNotFoundException;
import br.com.gerenciadorpilates.reporting.api.InstructorCommissionProfileResponse;
import br.com.gerenciadorpilates.reporting.api.UpsertInstructorCommissionProfileRequest;
import br.com.gerenciadorpilates.reporting.domain.InstructorCommissionProfile;
import br.com.gerenciadorpilates.reporting.infrastructure.InstructorCommissionProfileRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommissionProfileService {

    private final InstructorCommissionProfileRepository profileRepository;
    private final AppUserRepository appUserRepository;

    public CommissionProfileService(
            InstructorCommissionProfileRepository profileRepository,
            AppUserRepository appUserRepository
    ) {
        this.profileRepository = profileRepository;
        this.appUserRepository = appUserRepository;
    }

    @Transactional
    public InstructorCommissionProfileResponse upsert(UpsertInstructorCommissionProfileRequest request) {
        var instructor = appUserRepository.findById(request.instructorUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Instrutor nao encontrado."));

        if (instructor.getRole() != UserRole.INSTRUCTOR) {
            throw new IllegalArgumentException("O usuario informado nao possui perfil de instrutor.");
        }

        InstructorCommissionProfile profile = profileRepository.findByInstructorUserId(request.instructorUserId())
                .map(existing -> {
                    existing.update(request.commissionModel(), request.unitAmount(), request.active());
                    return existing;
                })
                .orElseGet(() -> new InstructorCommissionProfile(
                        UUID.randomUUID(),
                        instructor.getId(),
                        instructor.getFullName(),
                        request.commissionModel(),
                        request.unitAmount(),
                        request.active()
                ));

        return InstructorCommissionProfileResponse.from(profileRepository.save(profile));
    }

    @Transactional(readOnly = true)
    public List<InstructorCommissionProfileResponse> list() {
        return profileRepository.findAll()
                .stream()
                .map(InstructorCommissionProfileResponse::from)
                .toList();
    }
}
