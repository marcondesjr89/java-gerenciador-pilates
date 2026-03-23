package br.com.gerenciadorpilates.clinical.api;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

public record CreateStudentProgressEntryRequest(
        @NotNull OffsetDateTime recordedAt,
        @NotBlank @Size(max = 2000) String instructorNotes,
        @Min(0) @Max(100) Integer flexibilityScore,
        @Min(0) @Max(100) Integer strengthScore,
        @Min(0) @Max(10) Integer painLevel
) {
}
