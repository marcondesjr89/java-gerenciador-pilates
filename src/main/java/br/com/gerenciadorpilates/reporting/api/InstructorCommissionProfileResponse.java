package br.com.gerenciadorpilates.reporting.api;

import br.com.gerenciadorpilates.reporting.domain.CommissionModel;
import br.com.gerenciadorpilates.reporting.domain.InstructorCommissionProfile;
import java.math.BigDecimal;
import java.util.UUID;

public record InstructorCommissionProfileResponse(
        UUID id,
        UUID instructorUserId,
        String instructorName,
        CommissionModel commissionModel,
        BigDecimal unitAmount,
        boolean active
) {

    public static InstructorCommissionProfileResponse from(InstructorCommissionProfile profile) {
        return new InstructorCommissionProfileResponse(
                profile.getId(),
                profile.getInstructorUserId(),
                profile.getInstructorName(),
                profile.getCommissionModel(),
                profile.getUnitAmount(),
                profile.isActive()
        );
    }
}
